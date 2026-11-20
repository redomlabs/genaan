import Link from "next/link";
import { getBundles, getCatalog, getPortfolio, getSettings, getZones } from "../lib/data";
import { OurWork } from "../components/store/OurWork";
import { getT } from "../lib/i18n-server";
import { formatMoney, formatNumber, pick } from "../lib/format";
import { PLANTING_KINDS } from "../lib/types";
import { toFinderBundles } from "../lib/finder";
import { AreaFinder } from "../components/store/AreaFinder";
import { BundleCard } from "../components/store/BundleCard";
import { ShovelIcon, TruckIcon } from "../components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ t, lang }, bundles, catalog, settings, zones, portfolio] = await Promise.all([
    getT(),
    getBundles(),
    getCatalog(),
    getSettings(),
    getZones(),
    getPortfolio(),
  ]);
  const work = portfolio.enabled ? portfolio.projects.filter((p) => p.images.length > 0) : [];
  const business = bundles.filter((b) => b.service === "business");
  const trees = catalog.filter((c) => PLANTING_KINDS.includes(c.kind) && c.price !== null);
  const showcase = [...business].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder).slice(0, 3);
  const minZone = zones.length ? Math.min(...zones.map((z) => z.fee)) : null;

  return (
    <>
      {/* Hero: the two services are the two doors into the store. */}
      <section className="relative isolate overflow-hidden bg-forest-deep text-white">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center rtl:-scale-x-100"
          style={{ backgroundImage: "url('/assets/hero_image.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-deep/80 via-forest-deep/55 to-forest-deep/95 lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l lg:from-forest-deep/92 lg:via-forest-deep/60 lg:to-forest-deep/20" aria-hidden="true" />
        <div className="container-page flex min-h-[86svh] flex-col justify-end pb-12 pt-28 md:pb-16">
          <div className="hero-rise max-w-3xl">
            <h1 className="font-display text-4xl leading-[1.15] sm:text-5xl md:text-6xl">
              {t("خضرة تجهّز مكان شغلك، وشجر نزرعه في أرضك.", "Greenery for your workplace. Trees planted in your land.")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              {t(
                "باقات نباتات بسعر ثابت للشركات والعيادات والمحلات، وزراعة حدائق وأراضي بالشجر المثمر وشجر الزينة. سعر التوصيل والزراعة قدامك قبل ما تطلب.",
                "Fixed-price plant bundles for offices, clinics and shops, plus garden and land planting with fruit and ornamental trees. You see delivery and planting costs before you order.",
              )}
            </p>
          </div>

        </div>
      </section>

      {/* Area finder */}
      <section className="container-page py-16 md:py-24">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-2xl md:text-4xl">{t("قولنا المساحة، نقولك الباقة.", "Tell us the size. We'll suggest the bundle.")}</h2>
          <p className="mt-4 text-base leading-8 text-moss">
            {t(
              "كل باقة متصممة لمساحة معينة. حرّك المسطرة لمساحة مكانك أو أرضك وشوف الباقة اللي تناسبها وسعرها.",
              "Each bundle is planned for a range of space. Slide the ruler to your size to see the bundle that fits and what it costs.",
            )}
          </p>
        </div>
        <AreaFinder bundles={toFinderBundles(bundles)} showTabs />
      </section>

      {/* Workplace bundles */}
      {showcase.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl md:text-4xl">{t("باقات جاهزة لمكان شغلك", "Ready bundles for your workplace")}</h2>
              <p className="mt-4 text-base leading-8 text-moss">
                {t(
                  "نباتات ونخيل داخلي مختارة تتحمل التكييف والإضاءة الضعيفة، مع أصص متناسقة وتوزيع في المكان.",
                  "Indoor plants and palms chosen to cope with air-conditioning and low light, with matching pots and placement on site.",
                )}
              </p>
            </div>
            <Link href="/business" className="btn btn-outline shrink-0">
              {t(`كل الباقات (${formatNumber(business.length, lang)})`, `All ${business.length} bundles`)}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showcase.map((b) => (
              <BundleCard key={b.id} bundle={b} lang={lang} settings={settings} catalog={catalog} />
            ))}
          </div>
        </section>
      )}

      {/* Nursery price board */}
      {trees.length > 0 && (
        <section className="bg-harvest-soft/60 py-16 md:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="font-display text-2xl md:text-4xl">{t("أسعار الشجر، بالشجرة.", "Tree prices, tree by tree.")}</h2>
              <p className="mt-4 max-w-md text-base leading-8 text-moss">
                {t(
                  "اختار العدد اللي محتاجه من كل نوع، أو خد باقة زراعة جاهزة على قد مساحتك. لو عايزنا نزرعها، رسوم الزراعة بتتحسب بالشجرة.",
                  "Pick as many of each tree as you need, or choose a planting bundle sized to your land. If you want us to plant them, planting is priced per tree.",
                )}
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4">
                <ShovelIcon className="mt-0.5 shrink-0 text-harvest-deep" />
                <p className="num text-sm leading-6">
                  {t(
                    `زراعة الشجرة ${formatMoney(settings.plantingFeePerTree, lang)} في أغلب الأنواع`,
                    `Planting costs ${formatMoney(settings.plantingFeePerTree, lang)} per tree for most kinds`,
                  )}
                  {settings.plantingVisitFee > 0 &&
                    t(`، وزيارة الزراعة ${formatMoney(settings.plantingVisitFee, lang)} للطلب.`, `, plus a ${formatMoney(settings.plantingVisitFee, lang)} visit per order.`)}
                </p>
              </div>
              <Link href="/planting" className="btn btn-harvest mt-6">
                {t("شوف الشجر وباقات الزراعة", "Browse trees and planting bundles")}
              </Link>
            </div>
            <div className="rounded-[var(--radius-panel)] bg-white p-2 md:p-4">
              <table className="w-full text-start">
                <caption className="sr-only">{t("أسعار الشجر", "Tree prices")}</caption>
                <thead>
                  <tr className="text-xs text-moss">
                    <th scope="col" className="px-3 py-3 text-start font-semibold">{t("الشجرة", "Tree")}</th>
                    <th scope="col" className="hidden px-3 py-3 text-start font-semibold sm:table-cell">{t("الحجم", "Size")}</th>
                    <th scope="col" className="px-3 py-3 text-end font-semibold">{t("السعر", "Price")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {trees.slice(0, 9).map((tree) => (
                    <tr key={tree.id}>
                      <th scope="row" className="px-3 py-3 text-start font-semibold">
                        {pick(lang, tree.nameAr, tree.nameEn)}
                        <span className={`ms-2 inline-block h-2 w-2 rounded-full ${tree.kind === "fruit" ? "bg-harvest" : "bg-leaf"}`} aria-hidden="true" />
                      </th>
                      <td className="hidden px-3 py-3 text-sm text-moss sm:table-cell">{pick(lang, tree.sizeAr, tree.sizeEn)}</td>
                      <td className="num px-3 py-3 text-end font-bold">{formatMoney(tree.price ?? 0, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trees.length > 9 && (
                <Link href="/planting#trees" className="block px-3 py-3 text-sm font-semibold text-harvest-deep hover:underline">
                  {t(`و${formatNumber(trees.length - 9, lang)} أنواع تانية`, `and ${trees.length - 9} more`)}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Past work, shown only when the admin turns it on */}
      {work.length > 0 && (
        <section className="container-page pb-16 md:pb-24" aria-labelledby="our-work">
          <h2 id="our-work" className="font-display text-2xl md:text-4xl">{t("من شغلنا", "Our work")}</h2>
          <p className="mt-3 mb-8 max-w-2xl text-base leading-7 text-moss">
            {t("أماكن جهزناها وأراضي زرعناها لعملائنا.", "Spaces we've furnished and land we've planted for our clients.")}
          </p>
          <OurWork
            projects={work.map(({ id, service, titleAr, titleEn, clientAr, clientEn, descriptionAr, descriptionEn, images }) => ({ id, service, titleAr, titleEn, clientAr, clientEn, descriptionAr, descriptionEn, images }))}
          />
        </section>
      )}

      {/* How an order works */}
      <section className="container-page py-16 md:py-24">
        <h2 className="font-display max-w-2xl text-2xl md:text-4xl">{t("من الطلب لحد ما الخضرة توصل", "From your order to planted greenery")}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-4">
          {[
            [t("اختار", "Choose"), t("باقة على قد مساحتك، أو شجر بالعدد اللي محتاجه.", "A bundle sized to your space, or trees in the numbers you need.")],
            [t("اطلب أونلاين", "Order online"), t("حدد منطقتك وهتشوف التوصيل والزراعة والإجمالي قبل التأكيد.", "Pick your area and see delivery, planting and the total before you confirm.")],
            [t("نأكد معاك", "We confirm"), t("بنكلمك نراجع المكان ونحدد ميعاد التوصيل والزراعة.", "We call to check the site and agree a delivery and planting date.")],
            [t("نوصل ونزرع", "We deliver and plant"), t("الدفع عند الاستلام أو بتحويل بعد التأكيد.", "Pay on delivery, or by transfer once we confirm.")],
          ].map(([title, body], i) => (
            <li key={title} className="border-t-2 border-forest pt-5">
              <span className="num text-sm font-bold text-leaf">{formatNumber(i + 1, lang)}</span>
              <h3 className="mt-2 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-moss">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Delivery zones */}
      {zones.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <div className="grid gap-8 rounded-[var(--radius-panel)] border border-line-soft bg-white p-6 md:p-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <TruckIcon size={32} className="text-canopy" />
              <h2 className="mt-4 text-2xl font-bold md:text-3xl">{t("التوصيل حسب منطقتك", "Delivery priced by area")}</h2>
              <p className="mt-3 text-sm leading-7 text-moss">
                {settings.freeDeliveryThreshold > 0
                  ? t(
                      `التوصيل مجاني للطلبات من ${formatMoney(settings.freeDeliveryThreshold, lang)}.`,
                      `Free delivery on orders from ${formatMoney(settings.freeDeliveryThreshold, lang)}.`,
                    )
                  : minZone !== null
                    ? t(`يبدأ من ${formatMoney(minZone, lang)} للطلب كله، مهما كان عدد النباتات.`, `From ${formatMoney(minZone, lang)} for the whole order, however many plants.`)
                    : null}{" "}
                {t("منطقتك مش موجودة؟ كلمنا ونرتب التوصيل.", "Area not listed? Contact us and we'll arrange it.")}
              </p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {zones.map((z) => (
                <li key={z.id} className="flex items-baseline justify-between gap-4 border-b border-line-soft py-3 text-sm">
                  <span>{pick(lang, z.nameAr, z.nameEn)}</span>
                  <span className="num font-bold">{formatMoney(z.fee, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Larger projects */}
      <section className="container-page pb-20">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">{t("مشروع أكبر من الباقات؟", "A project bigger than our bundles?")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-moss">
              {t(
                "فروع كتير، كمباوند، أو أكتر من فدان. ابعت لنا التفاصيل ونجهز لك عرض سعر.",
                "Several branches, a compound or more than a feddan? Send us the details and we'll prepare a quote.",
              )}
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            {t("اطلب عرض سعر", "Request a quote")}
          </Link>
        </div>
      </section>
    </>
  );
}
