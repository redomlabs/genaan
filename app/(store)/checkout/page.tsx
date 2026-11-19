import type { Metadata } from "next";
import { getBundles, getCatalog, getSettings, getZones } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";
import { PLANTING_KINDS } from "../../lib/types";
import { CheckoutForm } from "../../components/store/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: pick(lang, "إتمام الطلب", "Checkout"), robots: { index: false } };
}

export default async function CheckoutPage() {
  const [{ t }, bundles, catalog, settings, zones] = await Promise.all([
    getT(),
    getBundles(),
    getCatalog(),
    getSettings(),
    getZones(),
  ]);
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-display text-4xl md:text-5xl">{t("إتمام الطلب", "Checkout")}</h1>
      <CheckoutForm
        bundles={bundles}
        items={catalog.filter((c) => PLANTING_KINDS.includes(c.kind))}
        zones={zones}
        fees={{
          plantingFeePerTree: settings.plantingFeePerTree,
          plantingVisitFee: settings.plantingVisitFee,
          freeDeliveryThreshold: settings.freeDeliveryThreshold,
        }}
      />
    </div>
  );
}
