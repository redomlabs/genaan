import { sql } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

/** Plants and trees. Indoor plants and palms make up business bundles; fruit and ornamental trees are sold for planting. */
export const catalogItems = sqliteTable(
  "catalog_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    kind: text("kind", { enum: ["indoor", "palm", "fruit", "ornamental", "seed"] }).notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    sizeAr: text("size_ar").notNull().default(""),
    sizeEn: text("size_en").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    /** EGP per plant or tree. Required for trees sold one by one. */
    price: integer("price"),
    /** EGP to plant one tree. Null uses the store-wide planting fee. */
    plantingFee: integer("planting_fee"),
    /** Square metres one tree needs, used to estimate tree counts from an area. */
    areaPerUnit: real("area_per_unit"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("catalog_items_kind").on(t.kind, t.isActive, t.sortOrder)],
);

export const bundles = sqliteTable(
  "bundles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    service: text("service", { enum: ["business", "planting"] }).notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    price: integer("price").notNull(),
    /** Suggested area in square metres. */
    areaMin: integer("area_min").notNull().default(0),
    areaMax: integer("area_max").notNull().default(0),
    /** Who the bundle suits: business types or land types. */
    audiences: text("audiences", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    extrasAr: text("extras_ar", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    extrasEn: text("extras_en", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("bundles_service").on(t.service, t.isActive, t.sortOrder)],
);

export const bundleItems = sqliteTable(
  "bundle_items",
  {
    bundleId: integer("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    itemId: integer("item_id")
      .notNull()
      .references(() => catalogItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
  },
  (t) => [primaryKey({ columns: [t.bundleId, t.itemId] })],
);

export const deliveryZones = sqliteTable("delivery_zones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  fee: integer("fee").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Unguessable token used in the customer's order link. */
    token: text("token").notNull().unique(),
    /** Short reference the customer reads out on the phone. */
    code: text("code").notNull().unique(),
    status: text("status", {
      enum: ["new", "confirmed", "scheduled", "completed", "cancelled"],
    })
      .notNull()
      .default("new"),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    zoneId: integer("zone_id"),
    zoneNameAr: text("zone_name_ar").notNull(),
    zoneNameEn: text("zone_name_en").notNull(),
    address: text("address").notNull(),
    preferredDate: text("preferred_date").notNull().default(""),
    notes: text("notes").notNull().default(""),
    paymentMethod: text("payment_method", { enum: ["cod", "transfer"] }).notNull(),
    subtotal: integer("subtotal").notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    plantingFee: integer("planting_fee").notNull(),
    total: integer("total").notNull(),
    lang: text("lang").notNull().default("ar"),
    adminNote: text("admin_note").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_status").on(t.status, t.createdAt), index("orders_phone").on(t.phone, t.createdAt)],
);

export type OrderLineContent = { nameAr: string; nameEn: string; quantity: number };

export const orderLines = sqliteTable("order_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["bundle", "item"] }).notNull(),
  refId: integer("ref_id").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  withPlanting: integer("with_planting", { mode: "boolean" }).notNull(),
  plantingFee: integer("planting_fee").notNull(),
  lineTotal: integer("line_total").notNull(),
  contents: text("contents", { mode: "json" }).$type<OrderLineContent[]>().notNull().default(sql`'[]'`),
});

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic: text("topic", { enum: ["business", "planting", "other"] }).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull().default(""),
  area: integer("area"),
  message: text("message").notNull().default(""),
  status: text("status", { enum: ["new", "handled"] }).notNull().default("new"),
  createdAt: createdAt(),
});

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** Increments on password change to sign out every other session. */
  sessionVersion: integer("session_version").notNull().default(1),
  createdAt: createdAt(),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  createdAt: createdAt(),
});
