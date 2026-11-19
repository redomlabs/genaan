import Link from "next/link";
import { getBundles, getSettings } from "../../../lib/data";
import { getT } from "../../../lib/i18n-server";
import { formatAreaRange, formatMoney, formatNumber, pick } from "../../../lib/format";
import { bundlePlantingFee, bundleTreeCount } from "../../../lib/pricing";
import type { Service } from "../../../lib/types";
import { Empty, PageHeader } from "../../ui/bits";
import { Thumb } from "../../../components/store/Thumb";

export default async function AdminBundlesPage() {
  const [{ t, lang }, bundles, settings] = await Promise.all([getT(), getBundles(undefined, true), getSettings()]);
  const groups: { service: Service; title: string; intro: string }[] = [
    {
      service: "business",
      title: t("باقات الأماكن (شركات، عيادات، محلات)", "Workplace bundles (offices, clinics, shops)"),
      intro: t("نباتات ونخيل داخلي بعدد وسعر ثابت.", "Indoor plants and palms at a fixed count and price."),
    },
    {
      service: "planting",
      title: t("باقات زراعة الحدائق والأراضي", "Garden and land planting bundles"),
      intro: t("شجر مثمر وزينة حسب المساحة. رسوم الزراعة بتتحسب من إعدادات الزراعة.", "Fruit and ornamental trees sized by area. Planting is charged from your planting fees."),
    },
  ];
  return (
    <>
      <PageHeader title={t("الباقات", "Bundles")} intro={t("اختار النباتات أو الشجر في كل باقة، وعددها، وسعرها، والمساحة المناسبة لها.", "Choose the plants or trees in each bundle, how many, the price and the area it suits.")} />
      <div className="space-y-10">
        {groups.map((g) => {
          const list = bundles.filter((b) => b.service === g.service);
          return (
            <section key={g.service}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">{g.title}</h2>
                  <p className="text-sm text-moss">{g.intro}</p>
                </div>
                <Link href={`/admin/bundles/new?service=${g.service}`} className={`btn btn-sm ${g.service === "planting" ? "btn-harvest" : "btn-primary"}`}>
                  {t("باقة جديدة", "New bundle")}
                </Link>
              </div>
              {list.length === 0 ? (
                <Empty>{t("مفيش باقات هنا. اعمل أول باقة.", "No bundles here yet. Create the first one.")}</Empty>
              ) : (
                <ul className="divide-y divide-line-soft overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-white">
                  {list.map((b) => (
                    <li key={b.id}>
                      <Link href={`/admin/bundles/${b.id}`} className="flex items-center gap-4 p-4 hover:bg-paper/50">
                        <Thumb src={b.imageUrl} alt="" service={b.service} className="h-16 w-20 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">
                            {pick(lang, b.nameAr, b.nameEn)}
                            {!b.isActive && <span className="ms-2 rounded bg-paper px-1.5 py-0.5 text-xs font-semibold text-moss">{t("مخفية", "Hidden")}</span>}
                            {b.isFeatured && <span className="ms-2 rounded bg-mist px-1.5 py-0.5 text-xs font-semibold text-canopy">{t("مميزة", "Featured")}</span>}
                          </p>
                          <p className="num text-sm text-moss">
                            {formatNumber(bundleTreeCount(b), lang)} {b.service === "planting" ? t("شجرة", "trees") : t("نبات", "plants")}
                            <span className="mx-2 text-line">|</span>
                            {formatAreaRange(b.areaMin, b.areaMax, lang)}
                            {b.service === "planting" && (
                              <>
                                <span className="mx-2 text-line">|</span>
                                {t("زراعة", "Planting")} {formatMoney(bundlePlantingFee(b, settings), lang)}
                              </>
                            )}
                          </p>
                        </div>
                        <p className="num shrink-0 text-lg font-bold">{formatMoney(b.price, lang)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
