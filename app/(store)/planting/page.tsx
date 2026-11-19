import type { Metadata } from "next";
import Link from "next/link";
import { getBundles, getCatalog, getSettings } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { formatMoney, pick } from "../../lib/format";
import { PLANTING_KINDS } from "../../lib/types";
import { toFinderBundles } from "../../lib/finder";
import { AreaFinder } from "../../components/store/AreaFinder";
import { BundleCard } from "../../components/store/BundleCard";
import { TreeCatalog } from "../../components/store/TreeCatalog";
import { RulerIcon, ShovelIcon, TruckIcon } from "../../components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick(lang, "زراعة الحدائق والأراضي وأسعار الشجر", "Garden and land planting, tree prices"),
    description: pick(
      lang,
      "شجر مثمر وشجر زينة بالسعر للشجرة، وباقات زراعة حسب مساحة الحديقة أو الأرض، مع التوصيل والزراعة.",
      "Fruit and ornamental trees priced per tree, and planting bundles sized to your garden or land, with delivery and planting.",
    ),
  };
}

export default async function PlantingPage() {
  const [{ t, lang }, bundles, catalog, settings] = await Promise.all([
    getT(),
    getBundles("planting"),
    getCatalog(),
    getSettings(),
  ]);
  const trees = catalog.filter((c) => PLANTING_KINDS.includes(c.kind) && c.price !== null);

  return (
    <>
      <header className="container-page pb-10 pt-12 md:pt-16">
        <h1 className="font-display max-w-3xl text-4xl leading-tight md:text-6xl">
          {t("نزرع حديقتك أو أرضك بالشجر.", "We plant your garden or land with trees.")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-moss md:text-lg">
          {t(
            "شجر مثمر وشجر زينة من المشتل لحد الجورة. اختار باقة على قد مساحة أرضك، أو اشتري الشجر بالعدد، وإحنا نوصّل ونزرع.",
            "Fruit and ornamental trees from our nursery to the planting pit. Choose a bundle sized to your land, or buy trees by number, and we deliver and plant them.",
          )}
        </p>
        <ul className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
          <li className="flex items-start gap-3">
            <RulerIcon className="mt-0.5 shrink-0 text-harvest-deep" />
            <span>{t("بنخطط أماكن الشجر والمسافات قبل الزراعة", "We plan positions and spacing before planting")}</span>
          </li>
          <li className="flex items-start gap-3">
            <ShovelIcon className="mt-0.5 shrink-0 text-harvest-deep" />
            <span className="num">
              {t(`الزراعة من ${formatMoney(settings.plantingFeePerTree, lang)} للشجرة`, `Planting from ${formatMoney(settings.plantingFeePerTree, lang)} a tree`)}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <TruckIcon className="mt-0.5 shrink-0 text-harvest-deep" />
            <span>{t("التوصيل للطلب كله حسب منطقتك", "One delivery fee for the order, by area")}</span>
          </li>
        </ul>
      </header>

      {bundles.length > 0 && (
        <>
          <section className="container-page pb-14">
            <AreaFinder bundles={toFinderBundles(bundles)} service="planting" />
          </section>
          <section className="container-page pb-16" aria-labelledby="planting-bundles">
            <h2 id="planting-bundles" className="text-2xl font-bold md:text-3xl">
              {t("باقات الزراعة", "Planting bundles")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-moss">
              {t(
                "عدد الشجر في كل باقة محسوب على المسافات المناسبة لكل نوع. سعر الباقة أقل من شراء نفس الشجر بالقطعة.",
                "Tree counts follow the right spacing for each kind. Each bundle costs less than buying the same trees one by one.",
              )}
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b) => (
                <BundleCard key={b.id} bundle={b} lang={lang} settings={settings} catalog={catalog} />
              ))}
            </div>
          </section>
        </>
      )}

      <section id="trees" className="scroll-mt-20 border-t border-line-soft bg-white py-16" aria-labelledby="trees-heading">
        <div className="container-page">
          <h2 id="trees-heading" className="font-display text-3xl md:text-5xl">
            {t("كتالوج الشجر", "Tree catalogue")}
          </h2>
          <p className="mt-3 mb-8 max-w-2xl text-sm leading-7 text-moss">
            {t(
              "السعر للشجرة الواحدة بالحجم المكتوب. علّم على «ازرعها لي» لو عايزنا نزرعها، ورسوم الزراعة بتظهر تحت كل نوع.",
              "Prices are per tree at the size shown. Tick “Plant it for me” if you want us to plant it; each tree shows its planting fee.",
            )}
          </p>
          <TreeCatalog trees={trees} defaultPlantingFee={settings.plantingFeePerTree} />
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-[var(--radius-panel)] bg-harvest-soft p-8 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">{t("أرض أكبر من فدان؟", "More than a feddan?")}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-moss">
            {t(
              "للمزارع والكمباوندات بنعمل معاينة ونقترح الأصناف ونظام الزراعة والري المناسب، وبعدين نبعت عرض سعر.",
              "For farms and compounds we visit the site, suggest varieties and a planting layout, then send a quote.",
            )}
          </p>
          <Link href="/contact?topic=planting" className="btn btn-harvest mt-6">
            {t("اطلب معاينة وعرض سعر", "Request a site visit and quote")}
          </Link>
        </div>
      </section>
    </>
  );
}
