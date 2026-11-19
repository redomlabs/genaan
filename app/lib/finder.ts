import type { Bundle, Service } from "./types";

/** The slice of a bundle the area finder needs on the client. */
export type FinderBundle = {
  id: number;
  slug: string;
  service: Service;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  areaMin: number;
  areaMax: number;
  count: number;
  isFeatured: boolean;
};

export function toFinderBundles(bundles: Bundle[]): FinderBundle[] {
  return bundles.map((b) => ({
    id: b.id,
    slug: b.slug,
    service: b.service,
    nameAr: b.nameAr,
    nameEn: b.nameEn,
    imageUrl: b.imageUrl,
    price: b.price,
    areaMin: b.areaMin,
    areaMax: b.areaMax,
    isFeatured: b.isFeatured,
    count: b.items.reduce((s, i) => s + i.quantity, 0),
  }));
}
