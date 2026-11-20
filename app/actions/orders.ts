"use server";

import { randomBytes, randomInt } from "node:crypto";
import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "../lib/db";
import { getBundles, getCatalog, getSettings, getZones } from "../lib/data";
import { normalizePhone } from "../lib/format";
import { computeQuote } from "../lib/pricing";
import type { CartLine, Lang, PaymentMethod } from "../lib/types";

export type PlaceOrderInput = {
  cart: CartLine[];
  zoneId: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  notes: string;
  paymentMethod: PaymentMethod;
  /** Hidden field that people leave empty. */
  website: string;
  lang: Lang;
};

export type FieldErrors = Partial<Record<"cart" | "zoneId" | "name" | "phone" | "email" | "address" | "preferredDate" | "notes" | "form", string>>;

export type PlaceOrderResult = { ok: true; token: string } | { ok: false; errors: FieldErrors };

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const orderCode = () => "GN-" + Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");

function cairoToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const ar = input?.lang !== "en";
  const msg = (a: string, e: string) => (ar ? a : e);
  const errors: FieldErrors = {};

  const name = String(input?.name ?? "").trim();
  const phone = normalizePhone(String(input?.phone ?? ""));
  const email = String(input?.email ?? "").trim();
  const address = String(input?.address ?? "").trim();
  const preferredDate = String(input?.preferredDate ?? "").trim();
  const notes = String(input?.notes ?? "").trim();
  const paymentMethod: PaymentMethod = input?.paymentMethod === "transfer" ? "transfer" : "cod";
  const cart = Array.isArray(input?.cart) ? input.cart.slice(0, 40) : [];

  if (input?.website) return { ok: false, errors: { form: msg("تعذر إرسال الطلب.", "The order could not be sent.") } };
  if (name.length < 2 || name.length > 80) errors.name = msg("اكتب الاسم (حرفين على الأقل).", "Enter your name (at least 2 characters).");
  if (!phone) errors.phone = msg("اكتب رقم موبايل صحيح، مثل 01012345678.", "Enter a valid mobile number, e.g. 01012345678.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = msg("الإيميل مش صحيح.", "This email address isn't valid.");
  if (address.length < 8 || address.length > 300) errors.address = msg("اكتب العنوان بالتفصيل (المنطقة، الشارع، رقم المبنى).", "Enter the full address (area, street, building).");
  if (preferredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || preferredDate < cairoToday()))
    errors.preferredDate = msg("اختار تاريخ من النهارده أو بعده.", "Choose today or a later date.");
  if (notes.length > 1000) errors.notes = msg("الملاحظات أطول من ١٠٠٠ حرف.", "Notes must be under 1000 characters.");

  const [zones, bundles, items, settings] = await Promise.all([getZones(), getBundles(), getCatalog(), getSettings()]);
  const zone = zones.find((z) => z.id === Number(input?.zoneId)) ?? null;
  if (!zone) errors.zoneId = msg("اختار منطقة التوصيل.", "Choose a delivery area.");

  const lines: CartLine[] = cart
    .filter((l) => (l?.type === "bundle" || l?.type === "item") && Number.isInteger(l.id))
    .map((l) => ({ type: l.type, id: l.id, quantity: Number(l.quantity), planting: Boolean(l.planting) }));
  const quote = computeQuote(lines, { bundles, items }, zone, settings);
  if (quote.lines.length === 0) errors.cart = msg("السلة فاضية.", "Your cart is empty.");
  else if (quote.unavailable.length) errors.cart = msg("في منتجات في السلة مبقتش متاحة. احذفها وكمّل.", "Some items in your cart are no longer available. Remove them to continue.");

  if (Object.keys(errors).length) return { ok: false, errors };

  const db = getDb();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(schema.orders)
    .where(and(eq(schema.orders.phone, phone), gte(schema.orders.createdAt, hourAgo)));
  if (recent >= 5) {
    return { ok: false, errors: { form: msg("وصلنا طلبات كتير من الرقم ده في آخر ساعة. كلمنا لو محتاج تعدل طلب.", "We've had several orders from this number in the last hour. Contact us if you need to change an order.") } };
  }

  const token = randomBytes(18).toString("base64url");
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .insert(schema.orders)
          .values({
            token,
            code: orderCode(),
            customerName: name,
            phone,
            email,
            zoneId: zone!.id,
            zoneNameAr: zone!.nameAr,
            zoneNameEn: zone!.nameEn,
            address,
            preferredDate,
            notes,
            paymentMethod,
            subtotal: quote.subtotal,
            deliveryFee: quote.deliveryFee,
            plantingFee: quote.plantingFee,
            total: quote.total,
            lang: ar ? "ar" : "en",
          })
          .returning({ id: schema.orders.id });
        await tx.insert(schema.orderLines).values(
          quote.lines.map((l) => ({
            orderId: order.id,
            type: l.type,
            refId: l.id,
            nameAr: l.nameAr,
            nameEn: l.nameEn,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            withPlanting: l.withPlanting,
            plantingFee: l.plantingFee,
            lineTotal: l.lineTotal,
            contents: l.contents,
          })),
        );
      });
      return { ok: true, token };
    } catch (error) {
      // A duplicate order code is the only expected conflict; try another code.
      if (!String(error).includes("UNIQUE") || attempt === 3) throw error;
    }
  }
  return { ok: false, errors: { form: msg("تعذر حفظ الطلب. جرّب تاني.", "The order could not be saved. Try again.") } };
}

export type TrackState = { error?: string };

export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const ar = formData.get("lang") !== "en";
  const code = String(formData.get("code") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const normalized = code.startsWith("GN-") ? code : `GN-${code.replace(/^GN/, "")}`;
  if (!phone || normalized.length < 6) {
    return { error: ar ? "اكتب رقم الطلب والموبايل اللي طلبت بيه." : "Enter your order number and the mobile number you ordered with." };
  }
  const [order] = await getDb()
    .select({ token: schema.orders.token })
    .from(schema.orders)
    .where(and(eq(schema.orders.code, normalized), eq(schema.orders.phone, phone)))
    .limit(1);
  if (!order) {
    await new Promise((r) => setTimeout(r, 400));
    return { error: ar ? "مفيش طلب بالرقم ده والموبايل ده. راجع الرقم في رسالة التأكيد." : "No order matches that number and mobile. Check the number in your confirmation." };
  }
  redirect(`/order/${order.token}`);
}

export type EnquiryState = { ok?: boolean; errors?: Partial<Record<"name" | "phone" | "message" | "form", string>> };

export async function createEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const ar = formData.get("lang") !== "en";
  const msg = (a: string, e: string) => (ar ? a : e);
  if (formData.get("website")) return { errors: { form: msg("تعذر الإرسال.", "Could not send.") } };
  const topicRaw = String(formData.get("topic") ?? "other");
  const topic = (["business", "planting", "other"] as const).find((t) => t === topicRaw) ?? "other";
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const city = String(formData.get("city") ?? "").trim().slice(0, 80);
  const areaValue = Number(formData.get("area"));
  const area = Number.isFinite(areaValue) && areaValue > 0 ? Math.round(areaValue) : null;
  const message = String(formData.get("message") ?? "").trim();
  const errors: EnquiryState["errors"] = {};
  if (name.length < 2 || name.length > 80) errors.name = msg("اكتب الاسم.", "Enter your name.");
  if (!phone) errors.phone = msg("اكتب رقم موبايل صحيح.", "Enter a valid mobile number.");
  if (message.length > 2000) errors.message = msg("الرسالة طويلة جدًا.", "The message is too long.");
  if (Object.keys(errors).length) return { errors };

  const db = getDb();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(schema.enquiries)
    .where(and(eq(schema.enquiries.phone, phone), gte(schema.enquiries.createdAt, dayAgo)));
  if (recent >= 3) return { errors: { form: msg("استلمنا رسايلك، وهنكلمك قريب.", "We already have your messages and will call you soon.") } };

  await db.insert(schema.enquiries).values({ topic, name, phone, city, area, message });
  return { ok: true };
}

export type OrderSummary = {
  token: string;
  code: string;
  status: "new" | "confirmed" | "scheduled" | "completed" | "cancelled";
  total: number;
  createdAt: number;
  items: { nameAr: string; nameEn: string; quantity: number }[];
};

/** Summaries for the orders this device has placed or looked up. Tokens are unguessable, so they act as the key. */
export async function getMyOrders(tokens: string[]): Promise<OrderSummary[]> {
  const valid = (Array.isArray(tokens) ? tokens : []).filter((t) => typeof t === "string" && /^[A-Za-z0-9_-]{20,40}$/.test(t)).slice(0, 30);
  if (valid.length === 0) return [];
  const db = getDb();
  const orders = await db
    .select({ id: schema.orders.id, token: schema.orders.token, code: schema.orders.code, status: schema.orders.status, total: schema.orders.total, createdAt: schema.orders.createdAt })
    .from(schema.orders)
    .where(inArray(schema.orders.token, valid))
    .orderBy(desc(schema.orders.createdAt));
  if (orders.length === 0) return [];
  const lines = await db
    .select({ orderId: schema.orderLines.orderId, nameAr: schema.orderLines.nameAr, nameEn: schema.orderLines.nameEn, quantity: schema.orderLines.quantity })
    .from(schema.orderLines)
    .where(inArray(schema.orderLines.orderId, orders.map((o) => o.id)));
  return orders.map((o) => ({
    token: o.token,
    code: o.code,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.getTime(),
    items: lines.filter((l) => l.orderId === o.id).map(({ nameAr, nameEn, quantity }) => ({ nameAr, nameEn, quantity })),
  }));
}
