import type { Metadata, Viewport } from "next";
import { Cairo, Fugaz_One, Inter } from "next/font/google";
import "./globals.css";
import { getLang } from "./lib/i18n-server";
import { LangProvider } from "./components/LangProvider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], display: "swap" });
const fugaz = Fugaz_One({ variable: "--font-fugaz", weight: "400", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const ar = lang === "ar";
  const title = ar ? "جنان | نباتات للأماكن وزراعة الحدائق" : "Genaan | Plants for workplaces, trees for gardens";
  const description = ar
    ? "باقات نباتات بسعر ثابت للشركات والعيادات والمحلات، وزراعة الحدائق والأراضي بالشجر المثمر وشجر الزينة في مصر."
    : "Fixed-price plant bundles for offices, clinics and shops, and garden and land planting with fruit and ornamental trees in Egypt.";
  return {
    metadataBase: new URL(process.env.SITE_URL || "https://www.genaan.shop"),
    title: { default: title, template: ar ? "%s | جنان" : "%s | Genaan" },
    description,
    openGraph: { title, description, type: "website", images: ["/assets/hero_image.png"] },
    icons: { icon: "/favicon.ico", apple: "/assets/icon.png" },
  };
}

export const viewport: Viewport = { themeColor: "#0d3a24" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${cairo.variable} ${fugaz.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
