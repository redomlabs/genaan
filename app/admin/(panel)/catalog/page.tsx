import Link from "next/link";
import { getCatalog, getSettings } from "../../../lib/data";
import { getT } from "../../../lib/i18n-server";
import { formatMoney, pick } from "../../../lib/format";
import { KIND_LABELS, type ItemKind } from "../../../lib/types";
import { Empty, PageHeader } from "../../ui/bits";
import { Thumb } from "../../../components/store/Thumb";

const KINDS: ItemKind[] = ["fruit", "ornamental", "indoor", "palm"];

export default async function AdminCatalogPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const [{ t, lang }, catalog, settings, { kind: kindParam }] = await Promise.all([getT(), getCatalog(true), getSettings(), searchParams]);
  const kind = KINDS.find((k) => k === kindParam) ?? "fruit";
  const list = catalog.filter((c) => c.kind === kind);
  const sellable = kind === "fruit" || kind === "ornamental";

  return (
    <>
      <PageHeader
        title={t("النباتات والشجر", "Plants and trees")}
        intro={t(
          "الشجر المثمر وشجر الزينة بيتباعوا بالشجرة في كتالوج الزراعة. النباتات والنخيل الداخلي بيظهروا جوه باقات الأماكن.",
          "Fruit and ornamental trees are sold one by one in the planting catalogue. Indoor plants and palms appear inside workplace bundles.",
        )}
        action={<Link href={`/admin/catalog/new?kind=${kind}`} className="btn btn-primary btn-sm">{t("إضافة نوع", "Add a variety")}</Link>}
      />
      <nav aria-label={t("الأقسام", "Sections")} className="mb-5 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Link
            key={k}
            href={`/admin/catalog?kind=${k}`}
            aria-current={k === kind ? "true" : undefined}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold aria-[current=true]:border-forest aria-[current=true]:bg-forest aria-[current=true]:text-white"
          >
            {pick(lang, KIND_LABELS[k].ar, KIND_LABELS[k].en)} <span className="num opacity-70">{catalog.filter((c) => c.kind === k).length}</span>
          </Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <Empty>{t("مفيش أنواع في القسم ده.", "No varieties in this section yet.")}</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/catalog/${item.id}`} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line-soft bg-white p-3 hover:border-canopy">
                <Thumb src={item.imageUrl} alt="" service={sellable ? "planting" : "business"} className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{pick(lang, item.nameAr, item.nameEn)}</p>
                  <p className="truncate text-xs text-moss">{pick(lang, item.sizeAr, item.sizeEn) || "—"}</p>
                  {sellable && (
                    <p className="num mt-0.5 text-sm">
                      <span className="font-semibold">{item.price !== null ? formatMoney(item.price, lang) : t("بدون سعر", "No price")}</span>
                      <span className="text-moss">
                        {" "}
                        {t("زراعة", "planting")} {formatMoney(item.plantingFee ?? settings.plantingFeePerTree, lang)}
                      </span>
                    </p>
                  )}
                </div>
                {!item.isActive && <span className="rounded bg-paper px-1.5 py-0.5 text-xs font-semibold text-moss">{t("مخفي", "Hidden")}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
