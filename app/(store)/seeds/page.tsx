import type { Metadata } from "next";
import { getCatalog, getSettings } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";
import { TreeCatalog } from "../../components/store/TreeCatalog";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick(lang, "بذور الخضار والنجيلة والزهور", "Vegetable, lawn and flower seeds"),
    description: pick(lang, "بذور خضار ونجيلة وزهور بالباكت، تتوصل مع طلبك.", "Vegetable, lawn and flower seeds by the packet, delivered with your order."),
  };
}

export default async function SeedsPage() {
  const [{ t }, catalog, settings] = await Promise.all([getT(), getCatalog(), getSettings()]);
  const seeds = catalog.filter((c) => c.kind === "seed" && c.price !== null);
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-display max-w-3xl text-3xl leading-tight md:text-4xl">{t("بذور تزرعها بنفسك.", "Seeds to sow yourself.")}</h1>
      <p className="mt-4 mb-8 max-w-2xl text-base leading-7 text-moss">
        {t(
          "بذور خضار ونجيلة وزهور بالباكت. تقدر تضيفها لطلب الشجر أو تطلبها لوحدها، والتوصيل حسب منطقتك.",
          "Vegetable, lawn and flower seeds by the packet. Add them to a tree order or order them on their own; delivery is priced by area.",
        )}
      </p>
      <TreeCatalog trees={seeds} defaultPlantingFee={settings.plantingFeePerTree} mode="seeds" />
    </div>
  );
}
