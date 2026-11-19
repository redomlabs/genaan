export type Lang = "ar" | "en";

export type ItemKind = "indoor" | "palm" | "fruit" | "ornamental";
export type Service = "business" | "planting";

export const PLANTING_KINDS: ItemKind[] = ["fruit", "ornamental"];
export const BUSINESS_KINDS: ItemKind[] = ["indoor", "palm"];

export type CatalogItem = {
  id: number;
  slug: string;
  kind: ItemKind;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sizeAr: string;
  sizeEn: string;
  imageUrl: string;
  price: number | null;
  plantingFee: number | null;
  areaPerUnit: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type BundleContent = {
  itemId: number;
  quantity: number;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  kind: ItemKind;
  plantingFee: number | null;
};

export type Bundle = {
  id: number;
  slug: string;
  service: Service;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  price: number;
  areaMin: number;
  areaMax: number;
  audiences: string[];
  extrasAr: string[];
  extrasEn: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  items: BundleContent[];
};

export type DeliveryZone = {
  id: number;
  nameAr: string;
  nameEn: string;
  fee: number;
  isActive: boolean;
  sortOrder: number;
};

export type StoreSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  addressAr: string;
  addressEn: string;
  plantingFeePerTree: number;
  plantingVisitFee: number;
  freeDeliveryThreshold: number;
};

export type OrderStatus = "new" | "confirmed" | "scheduled" | "completed" | "cancelled";
export type PaymentMethod = "cod" | "transfer";

export type CartLine = {
  type: "bundle" | "item";
  id: number;
  quantity: number;
  /** Plant the trees on site. Only applies to planting bundles and trees. */
  planting: boolean;
};

export const BUSINESS_AUDIENCES = [
  { value: "clinic", ar: "عيادات", en: "Clinics" },
  { value: "office", ar: "مكاتب وشركات", en: "Offices" },
  { value: "restaurant", ar: "مطاعم وكافيهات", en: "Cafés and restaurants" },
  { value: "hotel", ar: "فنادق", en: "Hotels" },
  { value: "retail", ar: "محلات ومعارض", en: "Shops and showrooms" },
] as const;

export const PLANTING_AUDIENCES = [
  { value: "garden", ar: "حدائق البيوت", en: "Home gardens" },
  { value: "villa", ar: "فيلات وكمباوندات", en: "Villas and compounds" },
  { value: "farm", ar: "أراضي زراعية", en: "Farmland" },
] as const;

export const KIND_LABELS: Record<ItemKind, { ar: string; en: string }> = {
  indoor: { ar: "نبات داخلي", en: "Indoor plant" },
  palm: { ar: "نخيل داخلي", en: "Indoor palm" },
  fruit: { ar: "شجر مثمر", en: "Fruit tree" },
  ornamental: { ar: "شجر زينة", en: "Ornamental tree" },
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, { ar: string; en: string }> = {
  new: { ar: "جديد", en: "New" },
  confirmed: { ar: "تم التأكيد", en: "Confirmed" },
  scheduled: { ar: "تم تحديد الموعد", en: "Scheduled" },
  completed: { ar: "تم التنفيذ", en: "Completed" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
};
