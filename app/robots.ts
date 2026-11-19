import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://www.genaan.shop";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/order/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
