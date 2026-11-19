"use client";

import { useMemo, useState } from "react";
import { formatMoney, formatNumber } from "../../lib/format";
import { treesForArea } from "../../lib/pricing";
import { KIND_LABELS, type CatalogItem } from "../../lib/types";
import { useLang } from "../LangProvider";
import { AddWithOptions } from "./AddToCart";
import { Thumb } from "./Thumb";

type Filter = "all" | "fruit" | "ornamental";

function spacing(areaPerUnit: number | null, lang: "ar" | "en") {
  if (!areaPerUnit) return null;
  const side = Math.round(Math.sqrt(areaPerUnit) * 10) / 10;
  return lang === "ar" ? `مسافة ${formatNumber(side, lang)}×${formatNumber(side, lang)} م` : `${side} × ${side} m spacing`;
}

export function TreeCatalog({ trees, defaultPlantingFee }: { trees: CatalogItem[]; defaultPlantingFee: number }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [area, setArea] = useState<number | "">("");
  const shown = useMemo(() => trees.filter((tree) => filter === "all" || tree.kind === filter), [trees, filter]);
  const counts = {
    all: trees.length,
    fruit: trees.filter((x) => x.kind === "fruit").length,
    ornamental: trees.filter((x) => x.kind === "ornamental").length,
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div role="group" aria-label={t("نوع الشجر", "Tree type")} className="flex flex-wrap gap-2">
          {(["all", "fruit", "ornamental"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:border-canopy"
              }`}
            >
              {f === "all" ? t("الكل", "All") : f === "fruit" ? t("شجر مثمر", "Fruit trees") : t("شجر زينة", "Ornamental")}{" "}
              <span className="num opacity-70">{formatNumber(counts[f], lang)}</span>
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
            className="field num !min-h-10 w-28 !py-1.5"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-moss">
          {t("مفيش شجر في القسم ده دلوقتي.", "No trees in this section right now.")}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((tree) => {
            const name = lang === "ar" ? tree.nameAr : tree.nameEn;
            const fits = area === "" ? null : treesForArea(area, tree.areaPerUnit);
            const fee = tree.plantingFee ?? defaultPlantingFee;
            return (
              <li key={tree.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-white">
                <Thumb src={tree.imageUrl} alt={name} service="planting" className="aspect-[4/3] w-full" />
                <div className="flex flex-1 flex-col p-4">
                  <p className={`text-xs font-bold ${tree.kind === "fruit" ? "text-harvest-deep" : "text-canopy"}`}>
                    {lang === "ar" ? KIND_LABELS[tree.kind].ar : KIND_LABELS[tree.kind].en}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-6">{name}</h3>
                  {(tree.sizeAr || tree.sizeEn) && (
                    <p className="mt-1 text-sm text-moss">{lang === "ar" ? tree.sizeAr : tree.sizeEn}</p>
                  )}
                  {(tree.descriptionAr || tree.descriptionEn) && (
                    <p className="mt-2 text-sm leading-6 text-moss">{lang === "ar" ? tree.descriptionAr : tree.descriptionEn}</p>
                  )}
                  <div className="mt-auto pt-4">
                    <p className="num text-xl font-bold">
                      {formatMoney(tree.price ?? 0, lang)}
                      <span className="text-sm font-normal text-moss"> {t("للشجرة", "per tree")}</span>
                    </p>
                    {spacing(tree.areaPerUnit, lang) && <p className="num mt-0.5 text-xs text-moss">{spacing(tree.areaPerUnit, lang)}</p>}
                    {fits !== null && (
                      <p className="num mt-2 rounded-lg bg-mist px-2.5 py-1.5 text-xs font-semibold text-canopy">
                        {fits > 0
                          ? t(`مساحتك تكفي حوالي ${formatNumber(fits, lang)} شجرة`, `Your area fits about ${formatNumber(fits, lang)} trees`)
                          : t("المساحة أصغر من مسافة شجرة واحدة", "The area is smaller than one tree's spacing")}
                      </p>
                    )}
                    <div className="mt-3">
                      <AddWithOptions
                        product={{
                          type: "item",
                          id: tree.id,
                          nameAr: tree.nameAr,
                          nameEn: tree.nameEn,
                          imageUrl: tree.imageUrl,
                          price: tree.price ?? 0,
                          service: "planting",
                        }}
                        plantingFeePerUnit={fee}
                        compact
                      />
                    </div>
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
