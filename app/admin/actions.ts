"use server";

import { randomBytes } from "node:crypto";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "../lib/db";
import { endSession, requireAdmin, startSession } from "../lib/auth";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "../lib/password";
import { getLang } from "../lib/i18n-server";
import { slugify } from "../lib/format";
import { BUSINESS_AUDIENCES, BUSINESS_KINDS, PLANTING_AUDIENCES, PLANTING_KINDS, type ItemKind, type OrderStatus, type Service } from "../lib/types";

export type ActionResult = { ok?: boolean; error?: string; id?: number };

async function msg(ar: string, en: string) {
  return (await getLang()) === "ar" ? ar : en;
}

const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const int = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const lines = (v: unknown) =>
  str(v, 2000)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);

function refreshStore() {
  revalidatePath("/", "layout");
}

// ─── Session ────────────────────────────────────────────────────────────────

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = str(formData.get("email"), 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [admin] = await getDb().select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  const valid = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: await msg("الإيميل أو كلمة السر غلط.", "The email or password is incorrect.") };
  }
  await startSession(admin);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const db = getDb();
  const [row] = await db.select().from(schema.admins).where(eq(schema.admins.id, admin.id));
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return { error: await msg("كلمة السر الحالية غلط.", "Your current password is incorrect.") };
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { error: await msg(`كلمة السر الجديدة لازم ${MIN_PASSWORD_LENGTH} حروف على الأقل.`, `The new password needs at least ${MIN_PASSWORD_LENGTH} characters.`) };
  }
  const [updated] = await db
    .update(schema.admins)
    .set({ passwordHash: await hashPassword(next), sessionVersion: sql`${schema.admins.sessionVersion} + 1` })
    .where(eq(schema.admins.id, admin.id))
    .returning();
  // Other devices are signed out; this one gets a fresh session.
  await startSession(updated);
  return { ok: true };
}

// ─── Images ─────────────────────────────────────────────────────────────────

const IMAGE_TYPES: Record<string, (b: Buffer) => boolean> = {
  "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
};

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: await msg("اختار صورة.", "Choose an image.") };
  if (file.size > 3 * 1024 * 1024) return { error: await msg("الصورة أكبر من ٣ ميجا.", "The image is larger than 3 MB.") };
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = IMAGE_TYPES[file.type];
  if (!check || !check(buffer)) return { error: await msg("الصورة لازم تكون WebP أو JPEG أو PNG.", "Images must be WebP, JPEG or PNG.") };
  const id = randomBytes(16).toString("base64url");
  await getDb().insert(schema.media).values({ id, mime: file.type, size: buffer.length, data: buffer });
  return { url: `/media/${id}` };
}

// ─── Catalogue ──────────────────────────────────────────────────────────────

export type ItemInput = {
  id?: number;
  kind: ItemKind;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sizeAr: string;
  sizeEn: string;
  imageUrl: string;
  price: string;
  plantingFee: string;
  areaPerUnit: string;
  isActive: boolean;
  sortOrder: string;
};

const KINDS: ItemKind[] = ["indoor", "palm", "fruit", "ornamental"];

function safeImageUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^\/media\/[A-Za-z0-9_-]{16,40}$/.test(v) || v.startsWith("/assets/")) return v;
  try {
    const url = new URL(v);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function saveItem(input: ItemInput): Promise<ActionResult> {
  await requireAdmin();
  const kind = KINDS.find((k) => k === input.kind);
  const nameAr = str(input.nameAr, 80);
  const nameEn = str(input.nameEn, 80);
  if (!kind) return { error: await msg("اختار النوع.", "Choose a type.") };
  if (!nameAr || !nameEn) return { error: await msg("اكتب الاسم بالعربي والإنجليزي.", "Enter the name in Arabic and English.") };
  const price = int(input.price);
  if (PLANTING_KINDS.includes(kind) && price === null) {
    return { error: await msg("الشجر اللي بيتباع لازم يكون له سعر.", "Trees for sale need a price.") };
  }
  const areaValue = Number(input.areaPerUnit);
  const values = {
    kind,
    slug: slugify(str(input.slug) || nameEn) || `item-${Date.now()}`,
    nameAr,
    nameEn,
    descriptionAr: str(input.descriptionAr, 300),
    descriptionEn: str(input.descriptionEn, 300),
    sizeAr: str(input.sizeAr, 80),
    sizeEn: str(input.sizeEn, 80),
    imageUrl: safeImageUrl(str(input.imageUrl, 600)),
    price,
    plantingFee: int(input.plantingFee),
    areaPerUnit: input.areaPerUnit !== "" && Number.isFinite(areaValue) && areaValue > 0 ? Math.round(areaValue * 10) / 10 : null,
    isActive: Boolean(input.isActive),
    sortOrder: int(input.sortOrder) ?? 0,
    updatedAt: new Date(),
  };
  const db = getDb();
  const clash = await db
    .select({ id: schema.catalogItems.id })
    .from(schema.catalogItems)
    .where(and(eq(schema.catalogItems.slug, values.slug), input.id ? ne(schema.catalogItems.id, input.id) : undefined));
  if (clash.length) values.slug = `${values.slug}-${randomBytes(2).toString("hex")}`;

  let id = input.id;
  if (id) {
    await db.update(schema.catalogItems).set(values).where(eq(schema.catalogItems.id, id));
  } else {
    [{ id }] = await db.insert(schema.catalogItems).values(values).returning({ id: schema.catalogItems.id });
  }
  refreshStore();
  return { ok: true, id };
}

export async function deleteItem(id: number): Promise<ActionResult> {
  await requireAdmin();
  const db = getDb();
  const [{ uses }] = await db.select({ uses: count() }).from(schema.bundleItems).where(eq(schema.bundleItems.itemId, id));
  if (uses > 0) {
    return { error: await msg(`النوع ده موجود في ${uses} باقة. شيله منها الأول، أو أوقف عرضه بدل الحذف.`, `This item is in ${uses} bundle(s). Remove it from them first, or hide it instead.`) };
  }
  await db.delete(schema.catalogItems).where(eq(schema.catalogItems.id, id));
  refreshStore();
  return { ok: true };
}

// ─── Bundles ────────────────────────────────────────────────────────────────

export type BundleInput = {
  id?: number;
  service: Service;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  price: string;
  areaMin: string;
  areaMax: string;
  audiences: string[];
  extrasAr: string;
  extrasEn: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
  items: { itemId: number; quantity: number }[];
};

export async function saveBundle(input: BundleInput): Promise<ActionResult> {
  await requireAdmin();
  const service: Service = input.service === "planting" ? "planting" : "business";
  const nameAr = str(input.nameAr, 80);
  const nameEn = str(input.nameEn, 80);
  const price = int(input.price);
  const areaMin = int(input.areaMin) ?? 0;
  const areaMax = int(input.areaMax) ?? 0;
  if (!nameAr || !nameEn) return { error: await msg("اكتب اسم الباقة بالعربي والإنجليزي.", "Enter the bundle name in Arabic and English.") };
  if (price === null || price <= 0) return { error: await msg("اكتب سعر الباقة.", "Enter the bundle price.") };
  if (areaMax && areaMax < areaMin) return { error: await msg("أقصى مساحة لازم تكون أكبر من أقل مساحة.", "The maximum area must be larger than the minimum.") };

  const db = getDb();
  const allowedKinds = service === "planting" ? PLANTING_KINDS : BUSINESS_KINDS;
  const catalog = await db.select({ id: schema.catalogItems.id, kind: schema.catalogItems.kind }).from(schema.catalogItems);
  const merged = new Map<number, number>();
  for (const line of Array.isArray(input.items) ? input.items : []) {
    const qty = int(line.quantity);
    const item = catalog.find((c) => c.id === Number(line.itemId));
    if (!item || !qty) continue;
    if (!allowedKinds.includes(item.kind)) {
      return { error: await msg("في نوع مش مناسب للخدمة دي في الباقة.", "The bundle includes an item that doesn't belong to this service.") };
    }
    merged.set(item.id, Math.min(10000, (merged.get(item.id) ?? 0) + qty));
  }
  if (merged.size === 0) return { error: await msg("اختار نباتات أو شجر للباقة.", "Add plants or trees to the bundle.") };

  const audienceValues = (service === "planting" ? PLANTING_AUDIENCES : BUSINESS_AUDIENCES).map((a) => a.value as string);
  const values = {
    service,
    slug: slugify(str(input.slug) || nameEn) || `bundle-${Date.now()}`,
    nameAr,
    nameEn,
    descriptionAr: str(input.descriptionAr, 400),
    descriptionEn: str(input.descriptionEn, 400),
    imageUrl: safeImageUrl(str(input.imageUrl, 600)),
    price,
    areaMin,
    areaMax,
    audiences: (input.audiences ?? []).filter((a) => audienceValues.includes(a)),
    extrasAr: lines(input.extrasAr),
    extrasEn: lines(input.extrasEn),
    isFeatured: Boolean(input.isFeatured),
    isActive: Boolean(input.isActive),
    sortOrder: int(input.sortOrder) ?? 0,
    updatedAt: new Date(),
  };
  const clash = await db
    .select({ id: schema.bundles.id })
    .from(schema.bundles)
    .where(and(eq(schema.bundles.slug, values.slug), input.id ? ne(schema.bundles.id, input.id) : undefined));
  if (clash.length) values.slug = `${values.slug}-${randomBytes(2).toString("hex")}`;

  const id = await db.transaction(async (tx) => {
    let bundleId = input.id;
    if (bundleId) {
      await tx.update(schema.bundles).set(values).where(eq(schema.bundles.id, bundleId));
      await tx.delete(schema.bundleItems).where(eq(schema.bundleItems.bundleId, bundleId));
    } else {
      [{ id: bundleId }] = await tx.insert(schema.bundles).values(values).returning({ id: schema.bundles.id });
    }
    await tx.insert(schema.bundleItems).values([...merged].map(([itemId, quantity]) => ({ bundleId: bundleId!, itemId, quantity })));
    return bundleId;
  });
  refreshStore();
  return { ok: true, id };
}

export async function deleteBundle(id: number): Promise<ActionResult> {
  await requireAdmin();
  await getDb().delete(schema.bundles).where(eq(schema.bundles.id, id));
  refreshStore();
  return { ok: true };
}

// ─── Fees and settings ──────────────────────────────────────────────────────

export async function saveZone(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = int(formData.get("id"));
  const nameAr = str(formData.get("nameAr"), 80);
  const nameEn = str(formData.get("nameEn"), 80);
  const fee = int(formData.get("fee"));
  if (!nameAr || !nameEn) return { error: await msg("اكتب اسم المنطقة بالعربي والإنجليزي.", "Enter the area name in Arabic and English.") };
  if (fee === null) return { error: await msg("اكتب رسوم التوصيل (ممكن صفر).", "Enter the delivery fee (it can be 0).") };
  const values = {
    nameAr,
    nameEn,
    fee,
    isActive: formData.get("isActive") === "on",
    sortOrder: int(formData.get("sortOrder")) ?? 0,
  };
  const db = getDb();
  if (id) await db.update(schema.deliveryZones).set(values).where(eq(schema.deliveryZones.id, id));
  else await db.insert(schema.deliveryZones).values(values);
  refreshStore();
  return { ok: true };
}

export async function deleteZone(id: number): Promise<ActionResult> {
  await requireAdmin();
  await getDb().delete(schema.deliveryZones).where(eq(schema.deliveryZones.id, id));
  refreshStore();
  return { ok: true };
}

const SETTING_FIELDS = {
  fees: ["planting_fee_per_tree", "planting_visit_fee", "free_delivery_threshold"],
  contact: ["phone", "whatsapp", "email", "instagram", "facebook", "address_ar", "address_en"],
} as const;

export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const group = formData.get("group") === "fees" ? "fees" : "contact";
  const rows: { key: string; value: string }[] = [];
  for (const key of SETTING_FIELDS[group]) {
    const raw = str(formData.get(key), 300);
    if (group === "fees") {
      const n = int(raw);
      if (n === null) return { error: await msg("الرسوم لازم تكون أرقام صحيحة (ممكن صفر).", "Fees must be whole numbers (0 is allowed).") };
      rows.push({ key, value: String(n) });
    } else if ((key === "instagram" || key === "facebook") && raw) {
      const safe = safeImageUrl(raw);
      if (!safe) return { error: await msg("روابط السوشيال لازم تبدأ بـ https://", "Social links must start with https://") };
      rows.push({ key, value: safe });
    } else {
      rows.push({ key, value: raw });
    }
  }
  const db = getDb();
  for (const row of rows) {
    await db.insert(schema.settings).values(row).onConflictDoUpdate({ target: schema.settings.key, set: { value: row.value } });
  }
  refreshStore();
  return { ok: true };
}

// ─── Orders and enquiries ───────────────────────────────────────────────────

const STATUSES: OrderStatus[] = ["new", "confirmed", "scheduled", "completed", "cancelled"];

export async function updateOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = int(formData.get("id"));
  const status = STATUSES.find((s) => s === formData.get("status"));
  if (!id || !status) return { error: await msg("بيانات غير صحيحة.", "Invalid data.") };
  await getDb()
    .update(schema.orders)
    .set({ status, adminNote: str(formData.get("adminNote"), 2000), updatedAt: new Date() })
    .where(eq(schema.orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function setEnquiryStatus(id: number, status: "new" | "handled"): Promise<ActionResult> {
  await requireAdmin();
  await getDb().update(schema.enquiries).set({ status }).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin/enquiries");
  return { ok: true };
}

