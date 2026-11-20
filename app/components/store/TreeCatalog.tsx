"use client";

import { useMemo, useState } from "react";
import { formatMoney, formatNumber } from "../../lib/format";
import { treesForArea } from "../../lib/pricing";
import { KIND_LABELS, PLANTING_KINDS, type CatalogItem, type ItemKind } from "../../lib/types";
import { useLang } from "../LangProvider";
import { AddWithOptions } from "./AddToCart";
import { Thumb } from "./Thumb";

type Filter = "all" | ItemKind;

/** Priced items sold one by one: trees (with type filter and area estimate) or seed packets. */
export function TreeCatalog({
  trees,
  defaultPlantingFee,
  mode = "trees",
}: {
  trees: CatalogItem[];
  defaultPlantingFee: number;
  mode?: "trees" | "seeds";
}) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [area, setArea] = useState<number | "">("");
  const isTrees = mode === "trees";
  const shown = useMemo(() => trees.filter((x) => filter === "all" || x.kind === filter), [trees, filter]);
  const filters: Filter[] = ["all", "fruit", "ornamental"];

  return (
    <div>
      {isTrees && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div role="group" aria-label={t("نوع الشجر", "Tree type")} className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  filter === f ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:border-canopy"
                }`}
              >
                {f === "all" ? t("الكل", "All") : f === "fruit" ? t("شجر مثمر", "Fruit trees") : t("شجر زينة", "Ornamental")}{" "}
                <span className="num opacity-70">
                  {formatNumber(f === "all" ? trees.length : trees.filter((x) => x.kind === f).length, lang)}
                </span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm text-moss">
            {t("احسب كام شجرة تكفي مساحة", "Estimate trees for an area of")}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder={t("م²", "m²")}
              value={area}
              onChange={(e) => setArea(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
              className="field num !min-h-9 w-24 !py-1"
            />
          </label>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="mt-6 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-moss">
          {isTrees ? t("مفيش شجر في القسم ده دلوقتي.", "No trees in this section right now.") : t("البذور هتنزل قريب.", "Seeds are coming soon.")}
        </p>
      ) : (
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isTrees ? "mt-6" : ""}`}>
          {shown.map((item) => {
            const name = lang === "ar" ? item.nameAr : item.nameEn;
            const plantable = PLANTING_KINDS.includes(item.kind);
            const fits = area === "" ? null : treesForArea(area, item.areaPerUnit);
            return (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-white">
                <Thumb src={item.imageUrl} alt={name} service={item.kind === "seed" ? "business" : "planting"} className="aspect-[4/3] w-full" />
                <div className="flex flex-1 flex-col p-4">
                  <p className={`text-xs font-bold ${item.kind === "ornamental" ? "text-canopy" : "text-harvest-deep"}`}>
                    {lang === "ar" ? KIND_LABELS[item.kind].ar : KIND_LABELS[item.kind].en}
                  </p>
                  <h3 className="mt-0.5 text-base font-bold leading-6">{name}</h3>
                  {(item.sizeAr || item.sizeEn) && <p className="text-sm text-moss">{lang === "ar" ? item.sizeAr : item.sizeEn}</p>}
                  {(item.descriptionAr || item.descriptionEn) && (
                    <p className="mt-1.5 text-sm leading-6 text-moss">{lang === "ar" ? item.descriptionAr : item.descriptionEn}</p>
                  )}
                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <p className="num text-lg font-bold">
                        {formatMoney(item.price ?? 0, lang)}
                        <span className="text-xs font-normal text-moss"> {isTrees ? t("للشجرة", "each") : t("للباكت", "a packet")}</span>
                      </p>
                      {plantable && (
                        <p className="num text-xs text-moss">
                          {t(`زراعة ${formatMoney(item.plantingFee ?? defaultPlantingFee, lang)}`, `Planting ${formatMoney(item.plantingFee ?? defaultPlantingFee, lang)}`)}
                        </p>
                      )}
                    </div>
                    {fits !== null && (
                      <p className="num mb-3 rounded-lg bg-mist px-2.5 py-1.5 text-xs font-semibold text-canopy">
                        {fits > 0
                          ? t(`مساحتك تكفي حوالي ${formatNumber(fits, lang)} شجرة`, `Your area fits about ${formatNumber(fits, lang)} trees`)
                          : t("المساحة أصغر من مسافة شجرة واحدة", "The area is smaller than one tree's spacing")}
                      </p>
                    )}
                    <AddWithOptions
                      plantable={plantable}
                      product={{
                        type: "item",
                        id: item.id,
                        nameAr: item.nameAr,
                        nameEn: item.nameEn,
                        imageUrl: item.imageUrl,
                        price: item.price ?? 0,
                        service: "planting",
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
