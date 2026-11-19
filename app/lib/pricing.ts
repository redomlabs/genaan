import {
  PLANTING_KINDS,
  type Bundle,
  type CartLine,
  type CatalogItem,
  type DeliveryZone,
  type StoreSettings,
} from "./types";

export const MAX_LINE_QUANTITY = 500;

export type PricedLine = {
  type: "bundle" | "item";
  id: number;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  /** Whether this line can be planted on site. */
  plantable: boolean;
  withPlanting: boolean;
  /** Trees that will be planted for this line. */
  trees: number;
  plantingFee: number;
  lineTotal: number;
  contents: { nameAr: string; nameEn: string; quantity: number }[];
};

export type Quote = {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  freeDelivery: boolean;
  plantingFee: number;
  plantingVisitFee: number;
  total: number;
  treesToPlant: number;
  /** Cart entries that are no longer for sale. */
  unavailable: CartLine[];
};

type FeeSettings = Pick<StoreSettings, "plantingFeePerTree" | "plantingVisitFee" | "freeDeliveryThreshold">;

export function treePlantingFee(fee: number | null, settings: FeeSettings): number {
  return fee ?? settings.plantingFeePerTree;
}

/** Planting cost for one unit of a planting bundle. */
export function bundlePlantingFee(bundle: Bundle, settings: FeeSettings): number {
  return bundle.items.reduce(
    (sum, item) => sum + item.quantity * treePlantingFee(item.plantingFee, settings),
    0,
  );
}

export function bundleTreeCount(bundle: Bundle): number {
  return bundle.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Prices a cart from catalogue data. The server runs this with database records
 * when an order is placed, so prices sent by the browser are never trusted.
 */
export function computeQuote(
  cart: CartLine[],
  catalog: { bundles: Bundle[]; items: CatalogItem[] },
  zone: DeliveryZone | null,
  settings: FeeSettings,
): Quote {
  const bundles = new Map(catalog.bundles.filter((b) => b.isActive).map((b) => [b.id, b]));
  const items = new Map(
    catalog.items
      .filter((i) => i.isActive && i.price !== null && PLANTING_KINDS.includes(i.kind))
      .map((i) => [i.id, i]),
  );
  const lines: PricedLine[] = [];
  const unavailable: CartLine[] = [];

  for (const entry of cart) {
    const quantity = Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(entry.quantity) || 1));
    if (entry.type === "bundle") {
      const bundle = bundles.get(entry.id);
      if (!bundle) {
        unavailable.push(entry);
        continue;
      }
      const plantable = bundle.service === "planting";
      const withPlanting = plantable && entry.planting;
      const trees = plantable ? bundleTreeCount(bundle) * quantity : 0;
      lines.push({
        type: "bundle",
        id: bundle.id,
        nameAr: bundle.nameAr,
        nameEn: bundle.nameEn,
        imageUrl: bundle.imageUrl,
        unitPrice: bundle.price,
        quantity,
        plantable,
        withPlanting,
        trees: withPlanting ? trees : 0,
        plantingFee: withPlanting ? bundlePlantingFee(bundle, settings) * quantity : 0,
        lineTotal: bundle.price * quantity,
        contents: bundle.items.map((i) => ({ nameAr: i.nameAr, nameEn: i.nameEn, quantity: i.quantity })),
      });
    } else {
      const item = items.get(entry.id);
      if (!item || item.price === null) {
        unavailable.push(entry);
        continue;
      }
      lines.push({
        type: "item",
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity,
        plantable: true,
        withPlanting: entry.planting,
        trees: entry.planting ? quantity : 0,
        plantingFee: entry.planting ? treePlantingFee(item.plantingFee, settings) * quantity : 0,
        lineTotal: item.price * quantity,
        contents: [],
      });
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const treesToPlant = lines.reduce((s, l) => s + l.trees, 0);
  const linePlanting = lines.reduce((s, l) => s + l.plantingFee, 0);
  const plantingVisitFee = treesToPlant > 0 ? settings.plantingVisitFee : 0;
  const freeDelivery =
    settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = lines.length === 0 || !zone || freeDelivery ? 0 : zone.fee;
  const plantingFee = linePlanting + plantingVisitFee;

  return {
    lines,
    subtotal,
    deliveryFee,
    freeDelivery,
    plantingFee,
    plantingVisitFee,
    total: subtotal + deliveryFee + plantingFee,
    treesToPlant,
    unavailable,
  };
}

/** Estimated number of trees an area can hold, using each tree's spacing. */
export function treesForArea(area: number, areaPerUnit: number | null): number | null {
  if (!areaPerUnit || areaPerUnit <= 0 || !Number.isFinite(area) || area <= 0) return null;
  return Math.floor(area / areaPerUnit);
}
