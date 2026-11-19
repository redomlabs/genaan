import Link from "next/link";
import { getT } from "../lib/i18n-server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-4xl md:text-5xl">{t("الصفحة دي مش موجودة.", "This page doesn't exist.")}</h1>
      <p className="mt-4 text-moss">{t("ممكن الرابط اتغير أو المنتج اتشال.", "The link may have changed or the product was removed.")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/business" className="btn btn-primary">{t("باقات الأماكن", "Workplace bundles")}</Link>
        <Link href="/planting" className="btn btn-harvest">{t("الشجر والزراعة", "Trees and planting")}</Link>
      </div>
    </div>
  );
}
