import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundleBySlug, getCatalog, getSettings } from "../../../lib/data";
import { getLang, getT } from "../../../lib/i18n-server";
import { formatAreaRange, formatMoney, formatNumber, pick } from "../../../lib/format";
import { bundlePlantingFee, bundleTreeCount, treePlantingFee } from "../../../lib/pricing";
import { BUSINESS_AUDIENCES, KIND_LABELS, PLANTING_AUDIENCES } from "../../../lib/types";
import { AddWithOptions } from "../../../components/store/AddToCart";
import { bundleSeparateValue } from "../../../components/store/BundleCard";
import { Thumb } from "../../../components/store/Thumb";
import { CheckIcon } from "../../../components/icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return {};
  return {
    title: pick(lang, bundle.nameAr, bundle.nameEn),
    description: pick(lang, bundle.descriptionAr, bundle.descriptionEn),
    openGraph: bundle.imageUrl ? { images: [bundle.imageUrl] } : undefined,
  };
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  const [{ t, lang }, bundle, settings, catalog] = await Promise.all([
    getT(),
    getBundleBySlug(slug),
    getSettings(),
    getCatalog(),
  ]);
  if (!bundle) notFound();

  const planting = bundle.service === "planting";
  const count = bundleTreeCount(bundle);
  const plantingFee = planting ? bundlePlantingFee(bundle, settings) : null;
  const separate = planting ? bundleSeparateValue(bundle, catalog) : null;
  const audiences = (planting ? PLANTING_AUDIENCES : BUSINESS_AUDIENCES).filter((a) => bundle.audiences.includes(a.value));
  const name = pick(lang, bundle.nameAr, bundle.nameEn);
  const extras = lang === "ar" ? bundle.extrasAr : bundle.extrasEn;

  return (
    <article className="container-page py-10 md:py-14">
      <nav aria-label={t("مسار الصفحة", "Breadcrumb")} className="mb-6 text-sm text-moss">
        <Link href={planting ? "/planting" : "/business"} className="hover:text-forest hover:underline">
          {planting ? t("زراعة الحدائق والأراضي", "Garden & land planting") : t("باقات الأماكن", "Workplace bundles")}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <Thumb src={bundle.imageUrl} alt={name} service={bundle.service} priority className="aspect-[4/3] w-full rounded-[var(--radius-panel)]" />

        <div>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">{name}</h1>
          <p className="mt-4 text-base leading-8 text-moss">{pick(lang, bundle.descriptionAr, bundle.descriptionEn)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line-soft py-5 text-sm">
            <div>
              <dt className="text-moss">{t("المساحة المناسبة", "Suited to")}</dt>
              <dd className="num mt-1 text-lg font-bold">{formatAreaRange(bundle.areaMin, bundle.areaMax, lang)}</dd>
            </div>
            <div>
              <dt className="text-moss">{planting ? t("عدد الشجر", "Trees") : t("عدد النباتات", "Plants")}</dt>
              <dd className="num mt-1 text-lg font-bold">{formatNumber(count, lang)}</dd>
            </div>
            {audiences.length > 0 && (
              <div className="col-span-2">
                <dt className="text-moss">{t("مناسبة لـ", "Good for")}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {audiences.map((a) => (
                    <span key={a.value} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-canopy">
                      {pick(lang, a.ar, a.en)}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <p className="num text-4xl font-bold">{formatMoney(bundle.price, lang)}</p>
            {separate !== null && separate > bundle.price && (
              <p className="num mt-1 text-sm text-moss">
                {t(
                  `لو اشتريت نفس الشجر بالقطعة: ${formatMoney(separate, lang)}. بتوفر ${formatMoney(separate - bundle.price, lang)}.`,
                  `The same trees bought separately: ${formatMoney(separate, lang)}. You save ${formatMoney(separate - bundle.price, lang)}.`,
                )}
              </p>
            )}
            <p className="mt-2 text-sm leading-6 text-moss">
              {planting
                ? t(
                    `التوصيل حسب منطقتك. زراعة شجر الباقة ${formatMoney(plantingFee ?? 0, lang)} لو اخترت الزراعة في الطلب.`,
                    `Delivery is priced by area. Planting this bundle costs ${formatMoney(plantingFee ?? 0, lang)} if you choose planting for the order.`,
                  )
                : t("الأصص والتوزيع في المكان مشمولين. التوصيل حسب منطقتك.", "Pots and placement on site are included. Delivery is priced by area.")}
            </p>
          </div>

          <div className="mt-6 max-w-md">
            <AddWithOptions
              product={{
                type: "bundle",
                id: bundle.id,
                nameAr: bundle.nameAr,
                nameEn: bundle.nameEn,
                imageUrl: bundle.imageUrl,
                price: bundle.price,
                service: bundle.service,
              }}
            />
          </div>

          {extras.length > 0 && (
            <ul className="mt-8 space-y-2.5">
              {extras.map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-sm">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-leaf" />
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-16" aria-labelledby="contents-heading">
        <h2 id="contents-heading" className="text-2xl font-bold md:text-3xl">
          {planting ? t("الشجر في الباقة", "Trees in this bundle") : t("النباتات في الباقة", "Plants in this bundle")}
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {bundle.items.map((item) => (
            <li key={item.itemId} className="overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-white">
              <div className="relative">
                <Thumb src={item.imageUrl} alt="" service={bundle.service} className="aspect-square w-full" />
                <span className="num absolute top-2 end-2 grid h-9 min-w-9 place-items-center rounded-full bg-forest px-2 text-sm font-bold text-white">
                  ×{formatNumber(item.quantity, lang)}
                </span>
              </div>
              <div className="p-3">
                <p className="font-semibold leading-6">{pick(lang, item.nameAr, item.nameEn)}</p>
                <p className="text-xs text-moss">{pick(lang, KIND_LABELS[item.kind].ar, KIND_LABELS[item.kind].en)}</p>
                {planting && (
                  <p className="num mt-1 text-xs text-moss">
                    {t(
                      `زراعة ${formatMoney(treePlantingFee(item.plantingFee, settings), lang)} للشجرة`,
                      `Planting ${formatMoney(treePlantingFee(item.plantingFee, settings), lang)} each`,
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-xs leading-6 text-moss">
          {t(
            "الصور للتوضيح. لو صنف مش متاح وقت التنفيذ بنقترح بديل بنفس الحجم والسعر وناخد موافقتك.",
            "Photos are illustrative. If a variety is out of stock we suggest an equivalent of the same size and price and ask you first.",
          )}
        </p>
      </section>
    </article>
  );
}
