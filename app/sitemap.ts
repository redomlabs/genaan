import type { MetadataRoute } from "next";
import { getBundles } from "./lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://www.genaan.shop";
  const pages = ["", "/business", "/planting", "/contact", "/about", "/faq", "/track"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
  }));
  const bundles = await getBundles().catch(() => []);
  return [...pages, ...bundles.map((b) => ({ url: `${base}/bundles/${b.slug}` }))];
}
