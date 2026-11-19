import { cache } from "react";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "./db";
import type { Bundle, CatalogItem, DeliveryZone, Service, StoreSettings } from "./types";

export const SETTING_DEFAULTS: Record<string, string> = {
  phone: "",
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  address_ar: "",
  address_en: "",
  planting_fee_per_tree: "50",
  planting_visit_fee: "0",
  free_delivery_threshold: "0",
};

function toInt(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await getDb().select().from(schema.settings);
  const v = { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  return {
    phone: v.phone,
    whatsapp: v.whatsapp,
    email: v.email,
    instagram: v.instagram,
    facebook: v.facebook,
    addressAr: v.address_ar,
    addressEn: v.address_en,
    plantingFeePerTree: toInt(v.planting_fee_per_tree, 50),
    plantingVisitFee: toInt(v.planting_visit_fee),
    freeDeliveryThreshold: toInt(v.free_delivery_threshold),
  };
});

export const getZones = cache(async (includeInactive = false): Promise<DeliveryZone[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.deliveryZones)
    .where(includeInactive ? undefined : eq(schema.deliveryZones.isActive, true))
    .orderBy(asc(schema.deliveryZones.sortOrder), asc(schema.deliveryZones.id));
  return rows;
});

export const getCatalog = cache(async (includeInactive = false): Promise<CatalogItem[]> => {
  const rows = await getDb()
    .select()
    .from(schema.catalogItems)
    .where(includeInactive ? undefined : eq(schema.catalogItems.isActive, true))
    .orderBy(asc(schema.catalogItems.sortOrder), asc(schema.catalogItems.id));
  return rows;
});

type BundleRow = typeof schema.bundles.$inferSelect;

async function attachItems(rows: BundleRow[]): Promise<Bundle[]> {
  if (rows.length === 0) return [];
  const contents = await getDb()
    .select({
      bundleId: schema.bundleItems.bundleId,
      itemId: schema.bundleItems.itemId,
      quantity: schema.bundleItems.quantity,
      nameAr: schema.catalogItems.nameAr,
      nameEn: schema.catalogItems.nameEn,
      imageUrl: schema.catalogItems.imageUrl,
      kind: schema.catalogItems.kind,
      plantingFee: schema.catalogItems.plantingFee,
      sortOrder: schema.catalogItems.sortOrder,
    })
    .from(schema.bundleItems)
    .innerJoin(schema.catalogItems, eq(schema.catalogItems.id, schema.bundleItems.itemId))
    .where(inArray(schema.bundleItems.bundleId, rows.map((r) => r.id)))
    .orderBy(desc(schema.bundleItems.quantity), asc(schema.catalogItems.sortOrder));
  return rows.map((row) => ({
    ...row,
    items: contents
      .filter((c) => c.bundleId === row.id)
      .map((c) => ({
        itemId: c.itemId,
        quantity: c.quantity,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        imageUrl: c.imageUrl,
        kind: c.kind,
        plantingFee: c.plantingFee,
      })),
  }));
}

export const getBundles = cache(
  async (service?: Service, includeInactive = false): Promise<Bundle[]> => {
    const filters = [
      service ? eq(schema.bundles.service, service) : undefined,
      includeInactive ? undefined : eq(schema.bundles.isActive, true),
    ].filter(Boolean);
    const rows = await getDb()
      .select()
      .from(schema.bundles)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(schema.bundles.sortOrder), asc(schema.bundles.id));
    return attachItems(rows);
  },
);

export const getBundleBySlug = cache(async (slug: string): Promise<Bundle | null> => {
  const rows = await getDb()
    .select()
    .from(schema.bundles)
    .where(and(eq(schema.bundles.slug, slug), eq(schema.bundles.isActive, true)))
    .limit(1);
  const [bundle] = await attachItems(rows);
  return bundle ?? null;
});

export async function getBundleById(id: number): Promise<Bundle | null> {
  const rows = await getDb().select().from(schema.bundles).where(eq(schema.bundles.id, id)).limit(1);
  const [bundle] = await attachItems(rows);
  return bundle ?? null;
}

export const getOrderByToken = cache(async (token: string) => {
  const db = getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.token, token)).limit(1);
  if (!order) return null;
  const lines = await db
    .select()
    .from(schema.orderLines)
    .where(eq(schema.orderLines.orderId, order.id))
    .orderBy(asc(schema.orderLines.id));
  return { ...order, lines };
});

export type OrderWithLines = NonNullable<Awaited<ReturnType<typeof getOrderByToken>>>;
