import type { Metadata } from "next";
import Link from "next/link";
import { getBundles, getCatalog, getSettings } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";
import { BUSINESS_AUDIENCES, BUSINESS_KINDS } from "../../lib/types";
import { toFinderBundles } from "../../lib/finder";
import { AreaFinder } from "../../components/store/AreaFinder";
import { BundleCard } from "../../components/store/BundleCard";
import { Thumb } from "../../components/store/Thumb";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick(lang, "باقات نباتات للشركات والعيادات", "Plant bundles for businesses"),
    description: pick(
      lang,
      "باقات نباتات ونخيل داخلي بسعر ثابت حسب مساحة المكان، مع الأصص والتوزيع.",
      "Fixed-price indoor plant and palm bundles sized to your space, with pots and placement.",
    ),
  };
}

export default async function BusinessPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const [{ t, lang }, bundles, catalog, settings, { for: audience }] = await Promise.all([
    getT(),
    getBundles("business"),
    getCatalog(),
    getSettings(),
    searchParams,
  ]);
  const active = BUSINESS_AUDIENCES.some((a) => a.value === audience) ? audience : undefined;
  const shown = active ? bundles.filter((b) => b.audiences.includes(active)) : bundles;
  const plants = catalog.filter((c) => BUSINESS_KINDS.includes(c.kind));

  return (
    <>
      <header className="container-page pb-10 pt-12 md:pt-16">
        <h1 className="font-display max-w-3xl text-4xl leading-tight md:text-6xl">
          {t("نباتات لمكان شغلك، بسعر ثابت.", "Plants for your workplace, at a fixed price.")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-moss md:text-lg">
          {t(
            "كل باقة فيها عدد محدد من النباتات والنخيل الداخلي اختارها فريق جنان على حسب المساحة، ومعاها أصص متناسقة وتوزيع في المكان. اختار الباقة على قد مساحتك واطلبها أونلاين.",
            "Each bundle has a set number of indoor plants and palms chosen by the Genaan team for a range of floor space, with matching pots and placement on site. Choose the one that fits and order it online.",
          )}
        </p>
      </header>

      <section className="container-page pb-14">
        <AreaFinder bundles={toFinderBundles(bundles)} service="business" />
      </section>

      <section className="container-page pb-16" aria-labelledby="bundles-heading">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 id="bundles-heading" className="text-2xl font-bold md:text-3xl">
            {t("كل الباقات", "All bundles")}
          </h2>
          <nav aria-label={t("فلتر حسب النشاط", "Filter by business")} className="flex flex-wrap gap-2">
            <Link
              href="/business"
              scroll={false}
              aria-current={!active ? "true" : undefined}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold aria-[current=true]:border-forest aria-[current=true]:bg-forest aria-[current=true]:text-white"
            >
              {t("الكل", "All")}
            </Link>
            {BUSINESS_AUDIENCES.map((a) => (
              <Link
                key={a.value}
                href={`/business?for=${a.value}`}
                scroll={false}
                aria-current={active === a.value ? "true" : undefined}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold aria-[current=true]:border-forest aria-[current=true]:bg-forest aria-[current=true]:text-white"
              >
                {pick(lang, a.ar, a.en)}
              </Link>
            ))}
          </nav>
        </div>
        {shown.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((b) => (
              <BundleCard key={b.id} bundle={b} lang={lang} settings={settings} catalog={catalog} />
            ))}
          </div>
        ) : (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-moss">
            {t("مفيش باقات للنشاط ده حاليًا. شوف كل الباقات أو اطلب عرض مخصوص.", "No bundles for this business type yet. See all bundles or ask for a tailored offer.")}
          </p>
        )}
        <p className="mt-6 max-w-3xl text-xs leading-6 text-moss">
          {t(
            "الصور للتوضيح. الأحجام والأصناف ممكن تختلف شوية حسب المتاح في المشتل، وبنأكد معاك قبل التنفيذ.",
            "Photos show the style. Sizes and varieties can vary slightly with nursery stock, and we confirm them with you before delivery.",
          )}
        </p>
      </section>

      {plants.length > 0 && (
        <section className="border-t border-line-soft bg-white py-16" aria-labelledby="plants-heading">
          <div className="container-page">
            <h2 id="plants-heading" className="text-2xl font-bold md:text-3xl">
              {t("النباتات اللي بنستخدمها في الباقات", "The plants in our bundles")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-moss">
              {t("أنواع بتعيش كويس جوه الأماكن المقفولة والمكيفة.", "Varieties that do well in closed, air-conditioned spaces.")}
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {plants.map((p) => (
                <li key={p.id}>
                  <Thumb src={p.imageUrl} alt="" className="aspect-square w-full rounded-2xl" />
                  <p className="mt-2 text-sm font-semibold">{pick(lang, p.nameAr, p.nameEn)}</p>
                  {(p.descriptionAr || p.descriptionEn) && (
                    <p className="mt-0.5 text-xs leading-5 text-moss">{pick(lang, p.descriptionAr, p.descriptionEn)}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <div className="rounded-[var(--radius-panel)] bg-mist p-8 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">{t("عندك أكتر من فرع أو مساحة كبيرة؟", "Several branches or a large space?")}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-moss">
            {t(
              "نعملك باقة على مقاسك بعد ما نعرف تفاصيل المكان والإضاءة وعدد الفروع.",
              "We'll put together a bundle for you once we know the space, the light and how many branches you have.",
            )}
          </p>
          <Link href="/contact?topic=business" className="btn btn-primary mt-6">
            {t("اطلب باقة مخصوصة", "Request a tailored bundle")}
          </Link>
        </div>
      </section>
    </>
  );
}
