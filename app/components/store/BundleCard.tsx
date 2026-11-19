import Link from "next/link";
import { formatAreaRange, formatMoney, formatNumber, pick } from "../../lib/format";
import { bundlePlantingFee, bundleTreeCount } from "../../lib/pricing";
import type { Bundle, CatalogItem, Lang, StoreSettings } from "../../lib/types";
import { AddBundleButton } from "./AddToCart";
import { Thumb } from "./Thumb";

/** What the trees in a planting bundle would cost one by one, when every tree has a price. */
export function bundleSeparateValue(bundle: Bundle, catalog: CatalogItem[]): number | null {
  let sum = 0;
  for (const line of bundle.items) {
    const item = catalog.find((c) => c.id === line.itemId);
    if (!item || item.price === null) return null;
    sum += item.price * line.quantity;
  }
  return sum;
}

export function BundleCard({
  bundle,
  lang,
  settings,
  catalog,
}: {
  bundle: Bundle;
  lang: Lang;
  settings: StoreSettings;
  catalog: CatalogItem[];
}) {
  const t = (ar: string, en: string) => pick(lang, ar, en);
  const planting = bundle.service === "planting";
  const count = bundleTreeCount(bundle);
  const separate = planting ? bundleSeparateValue(bundle, catalog) : null;
  const plantingFee = planting ? bundlePlantingFee(bundle, settings) : 0;
  const name = pick(lang, bundle.nameAr, bundle.nameEn);
  const faces = bundle.items.slice(0, 5);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white ${
        bundle.isFeatured ? (planting ? "border-harvest" : "border-canopy") : "border-line-soft"
      }`}
    >
      <Link href={`/bundles/${bundle.slug}`} className="relative block" tabIndex={-1} aria-hidden="true">
        <Thumb src={bundle.imageUrl} alt="" service={bundle.service} className="aspect-[3/2] w-full" />
        <span className="num absolute bottom-3 start-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-forest">
          {formatAreaRange(bundle.areaMin, bundle.areaMax, lang)}
        </span>
        {bundle.isFeatured && (
          <span
            className={`absolute top-3 start-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
              planting ? "bg-harvest-deep" : "bg-forest"
            }`}
          >
            {t("اختيار جنان", "Genaan's pick")}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-7">
          <Link href={`/bundles/${bundle.slug}`} className="hover:text-canopy">
            {name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-moss">{pick(lang, bundle.descriptionAr, bundle.descriptionEn)}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {faces.map((f) => (
              <Thumb
                key={f.itemId}
                src={f.imageUrl}
                alt=""
                service={bundle.service}
                className="h-9 w-9 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <p className="text-sm">
            <span className="num font-bold">{formatNumber(count, lang)}</span>{" "}
            <span className="text-moss">
              {planting ? t("شجرة", "trees") : t("نبات مع الأصص", "plants with pots")}
            </span>
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="num text-2xl font-bold">{formatMoney(bundle.price, lang)}</span>
            {separate !== null && separate > bundle.price && (
              <span className="num text-sm text-moss line-through decoration-1">{formatMoney(separate, lang)}</span>
            )}
          </div>
          <p className="num mt-1 text-xs text-moss">
            {planting
              ? t(`+ زراعة ${formatMoney(plantingFee, lang)} لو اخترتها، والتوصيل حسب منطقتك`, `+ ${formatMoney(plantingFee, lang)} planting if you want it, delivery by area`)
              : t("التوزيع في المكان مشمول، والتوصيل حسب منطقتك", "Placement included, delivery priced by area")}
          </p>
          <div className="mt-4 flex gap-2">
            <AddBundleButton
              className="flex-1"
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
            <Link href={`/bundles/${bundle.slug}`} className="btn btn-outline" aria-label={t(`تفاصيل ${name}`, `${name} details`)}>
              {t("التفاصيل", "Details")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
