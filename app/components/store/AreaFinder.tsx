"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { FEDDAN_M2, formatArea, formatAreaParts, formatAreaRange, formatMoney, formatNumber } from "../../lib/format";
import type { Service } from "../../lib/types";
import type { FinderBundle } from "../../lib/finder";
import { useLang } from "../LangProvider";
import { AddBundleButton } from "./AddToCart";
import { Thumb } from "./Thumb";


const SCALES: Record<Service, { min: number; max: number; log: boolean; start: number }> = {
  business: { min: 10, max: 320, log: false, start: 70 },
  planting: { min: 50, max: 2 * FEDDAN_M2, log: true, start: 300 },
};

const STEPS = 1000;

function toPosition(area: number, service: Service): number {
  const s = SCALES[service];
  const a = Math.min(s.max, Math.max(s.min, area));
  const ratio = s.log ? Math.log(a / s.min) / Math.log(s.max / s.min) : (a - s.min) / (s.max - s.min);
  return Math.round(ratio * STEPS);
}

function fromPosition(position: number, service: Service): number {
  const s = SCALES[service];
  const ratio = position / STEPS;
  const raw = s.log ? s.min * Math.pow(s.max / s.min, ratio) : s.min + ratio * (s.max - s.min);
  const step = raw < 200 ? 5 : raw < 1000 ? 25 : raw < 4000 ? 100 : 250;
  return Math.round(raw / step) * step;
}

function match(bundles: FinderBundle[], area: number) {
  const inside = bundles.filter((b) => area >= b.areaMin && area <= b.areaMax);
  if (inside.length) {
    return { bundle: inside.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))[0], exact: true };
  }
  const distance = (b: FinderBundle) => (area < b.areaMin ? b.areaMin - area : area - b.areaMax);
  const nearest = [...bundles].sort((a, b) => distance(a) - distance(b))[0];
  return nearest ? { bundle: nearest, exact: false } : null;
}

/**
 * The area finder: a measuring-tape slider with each bundle marked on it.
 * Drag to your space's size and the matching bundle appears beside it.
 */
export function AreaFinder({
  bundles,
  service: fixedService,
  showTabs = false,
}: {
  bundles: FinderBundle[];
  service?: Service;
  showTabs?: boolean;
}) {
  const { t, lang } = useLang();
  const [service, setService] = useState<Service>(fixedService ?? "business");
  const [areas, setAreas] = useState<Record<Service, number>>({
    business: SCALES.business.start,
    planting: SCALES.planting.start,
  });
  const area = areas[service];
  const id = useId();
  const pool = useMemo(
    () => bundles.filter((b) => b.service === service).sort((a, b) => a.areaMin - b.areaMin),
    [bundles, service],
  );
  const result = match(pool, area);
  const planting = service === "planting";
  const setArea = (value: number) => setAreas((a) => ({ ...a, [service]: value }));

  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-panel)] text-white ${planting ? "bg-[#3d2f12]" : "bg-forest"}`}
      style={{ ["--thumb" as string]: planting ? "#f0c36b" : "var(--color-mint)" }}
    >
      <div className="grid gap-0 lg:grid-cols-[1.25fr_1fr]">
        <div className="p-6 md:p-10">
          {showTabs && (
            <div role="tablist" aria-label={t("نوع المكان", "Type of space")} className="mb-8 inline-flex rounded-full bg-white/10 p-1">
              {(["business", "planting"] as Service[]).map((s) => (
                <button
                  key={s}
                  role="tab"
                  type="button"
                  aria-selected={service === s}
                  onClick={() => setService(s)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    service === s ? "bg-white text-forest" : "text-white/80 hover:text-white"
                  }`}
                >
                  {s === "business" ? t("مكان شغل", "A workplace") : t("حديقة أو أرض", "A garden or land")}
                </button>
              ))}
            </div>
          )}
          <label htmlFor={`${id}-ruler`} className="block text-base font-semibold text-white/85">
            {planting ? t("مساحة الأرض اللي هتزرعها", "Area you want planted") : t("مساحة المكان اللي هتتجهز", "Floor area to furnish with plants")}
          </label>
          <p className="mt-2 flex items-baseline gap-3" aria-live="polite">
            <span className="font-display num text-6xl leading-none md:text-7xl">{formatAreaParts(area, lang).value}</span>
            <span className="text-xl font-semibold text-white/80">{formatAreaParts(area, lang).unit}</span>
          </p>
          {planting && area >= 500 && area < FEDDAN_M2 && (
            <p className="num mt-2 text-sm text-white/70">
              {t(`حوالي ${formatNumber(Math.round(area / 175), lang)} قيراط`, `About ${formatNumber(Math.round(area / 175), lang)} qirat`)}
            </p>
          )}

          <div className="relative mt-8">
            <input
              id={`${id}-ruler`}
              type="range"
              min={0}
              max={STEPS}
              value={toPosition(area, service)}
              onChange={(e) => setArea(fromPosition(Number(e.target.value), service))}
              className="ruler relative z-10"
              aria-valuetext={formatArea(area, lang)}
            />
            <div className="relative mt-2 h-2" aria-hidden="true">
              {pool.map((b) => {
                const start = (toPosition(b.areaMin, service) / STEPS) * 100;
                const end = (toPosition(b.areaMax, service) / STEPS) * 100;
                const active = result?.bundle.id === b.id;
                return (
                  <span
                    key={b.id}
                    className={`absolute top-0 h-2 rounded-full transition-colors ${active ? "bg-[var(--thumb)]" : "bg-white/25"}`}
                    style={{ insetInlineStart: `${start}%`, width: `max(${end - start}%, 6px)` }}
                  />
                );
              })}
            </div>
            <div className="num mt-2 flex justify-between text-xs text-white/60" aria-hidden="true">
              <span>{formatArea(SCALES[service].min, lang)}</span>
              <span>{formatArea(SCALES[service].max, lang)}</span>
            </div>
          </div>
          <label className="mt-6 flex max-w-xs items-center gap-3 text-sm text-white/80">
            {t("أو اكتب المساحة بالمتر", "Or type it in m²")}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={area}
              onChange={(e) => setArea(Math.max(1, Number(e.target.value) || 1))}
              className="num h-10 w-28 rounded-lg border border-white/25 bg-white/10 px-3 text-white focus:border-white focus:outline-none"
            />
          </label>
        </div>

        <div className="bg-black/15 p-6 md:p-10">
          {result ? (
            <div className="flex h-full flex-col">
              <p className="text-sm font-semibold text-white/75">
                {result.exact ? t("الباقة المناسبة لمساحتك", "The bundle for your space") : t("أقرب باقة لمساحتك", "The closest bundle")}
              </p>
              <Thumb src={result.bundle.imageUrl} alt="" service={service} className="mt-4 aspect-[16/10] w-full rounded-2xl" />
              <h3 className="mt-4 text-2xl font-bold">{lang === "ar" ? result.bundle.nameAr : result.bundle.nameEn}</h3>
              <p className="num mt-1 flex flex-wrap gap-x-4 text-sm text-white/75">
                <span>{formatNumber(result.bundle.count, lang)} {planting ? t("شجرة", "trees") : t("نبات", "plants")}</span>
                <span>{formatAreaRange(result.bundle.areaMin, result.bundle.areaMax, lang)}</span>
              </p>
              <p className="num mt-3 text-3xl font-bold">{formatMoney(result.bundle.price, lang)}</p>
              {!result.exact && (
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {area > result.bundle.areaMax
                    ? t("مساحتك أكبر من باقاتنا الجاهزة. ممكن تاخد أكتر من باقة أو نعملك عرض مخصوص.", "Your space is larger than our ready bundles. Combine bundles or ask us for a tailored offer.")
                    : t("مساحتك أصغر من أصغر باقة. شوف الشجر بالقطعة أو كلمنا.", "Your space is smaller than our smallest bundle. Buy trees one by one or talk to us.")}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <AddBundleButton
                  className="flex-1 !bg-white !text-forest hover:!bg-mint"
                  product={{
                    type: "bundle",
                    id: result.bundle.id,
                    nameAr: result.bundle.nameAr,
                    nameEn: result.bundle.nameEn,
                    imageUrl: result.bundle.imageUrl,
                    price: result.bundle.price,
                    service: result.bundle.service,
                  }}
                />
                <Link href={`/bundles/${result.bundle.slug}`} className="btn border border-white/30 text-white hover:bg-white/10">
                  {t("شوف المحتوى", "See what's inside")}
                </Link>
              </div>
              {!result.exact && (
                <Link href={`/contact?topic=${service}&area=${area}`} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">
                  {t("اطلب عرض مخصوص", "Ask for a tailored offer")}
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/75">{t("الباقات هتظهر هنا قريب.", "Bundles will appear here soon.")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
