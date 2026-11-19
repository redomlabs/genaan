"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteBundle, saveBundle, type BundleInput } from "../actions";
import { useLang } from "../../components/LangProvider";
import { formatMoney, formatNumber, pick } from "../../lib/format";
import {
  BUSINESS_AUDIENCES,
  BUSINESS_KINDS,
  KIND_LABELS,
  PLANTING_AUDIENCES,
  PLANTING_KINDS,
  type Bundle,
  type CatalogItem,
  type Service,
} from "../../lib/types";
import { ImageField } from "./ImageField";
import { Thumb } from "../../components/store/Thumb";
import { MinusIcon, PlusIcon } from "../../components/icons";

export function BundleForm({
  bundle,
  service,
  catalog,
  plantingFeePerTree,
}: {
  bundle: Bundle | null;
  service: Service;
  catalog: CatalogItem[];
  plantingFeePerTree: number;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<Omit<BundleInput, "items">>({
    id: bundle?.id,
    service,
    slug: bundle?.slug ?? "",
    nameAr: bundle?.nameAr ?? "",
    nameEn: bundle?.nameEn ?? "",
    descriptionAr: bundle?.descriptionAr ?? "",
    descriptionEn: bundle?.descriptionEn ?? "",
    imageUrl: bundle?.imageUrl ?? "",
    price: bundle ? String(bundle.price) : "",
    areaMin: bundle ? String(bundle.areaMin) : "",
    areaMax: bundle ? String(bundle.areaMax) : "",
    audiences: bundle?.audiences ?? [],
    extrasAr: (bundle?.extrasAr ?? []).join("\n"),
    extrasEn: (bundle?.extrasEn ?? []).join("\n"),
    isFeatured: bundle?.isFeatured ?? false,
    isActive: bundle?.isActive ?? true,
    sortOrder: bundle ? String(bundle.sortOrder) : "0",
  });
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries((bundle?.items ?? []).map((i) => [i.itemId, i.quantity])),
  );
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const planting = service === "planting";
  const kinds = planting ? PLANTING_KINDS : BUSINESS_KINDS;
  const options = catalog.filter((c) => kinds.includes(c.kind));
  const audiences = planting ? PLANTING_AUDIENCES : BUSINESS_AUDIENCES;

  const totals = useMemo(() => {
    let count = 0;
    let separate = 0;
    let priced = true;
    let plantingFee = 0;
    for (const [id, qty] of Object.entries(quantities)) {
      const item = catalog.find((c) => c.id === Number(id));
      if (!item || !qty) continue;
      count += qty;
      if (item.price === null) priced = false;
      else separate += item.price * qty;
      plantingFee += (item.plantingFee ?? plantingFeePerTree) * qty;
    }
    return { count, separate: priced ? separate : null, plantingFee };
  }, [quantities, catalog, plantingFeePerTree]);

  const setQty = (id: number, qty: number) =>
    setQuantities((q) => {
      const next = { ...q };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(10000, qty);
      return next;
    });

  function submit() {
    setError("");
    startTransition(async () => {
      const result = await saveBundle({
        ...form,
        items: Object.entries(quantities).map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity })),
      });
      if (result.error) setError(result.error);
      else {
        router.push("/admin/bundles");
        router.refresh();
      }
    });
  }

  function remove() {
    if (!bundle || !confirm(t("تحذف الباقة دي؟ الطلبات القديمة مش هتتأثر.", "Delete this bundle? Past orders are not affected."))) return;
    startTransition(async () => {
      await deleteBundle(bundle.id);
      router.push("/admin/bundles");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]"
    >
      <div className="space-y-6">
        <section className="space-y-5 rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nameAr" className="label">{t("الاسم بالعربي", "Name in Arabic")}</label>
              <input id="nameAr" dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} required className="field" />
            </div>
            <div>
              <label htmlFor="nameEn" className="label">{t("الاسم بالإنجليزي", "Name in English")}</label>
              <input id="nameEn" dir="ltr" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required className="field" />
            </div>
            <div>
              <label htmlFor="descriptionAr" className="label">{t("وصف قصير بالعربي", "Short description in Arabic")}</label>
              <textarea id="descriptionAr" dir="rtl" rows={3} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="descriptionEn" className="label">{t("وصف قصير بالإنجليزي", "Short description in English")}</label>
              <textarea id="descriptionEn" dir="ltr" rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="field" />
            </div>
          </div>
          <ImageField label={t("صورة الباقة", "Bundle photo")} value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
        </section>

        <section className="rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6">
          <h2 className="text-lg font-bold">{planting ? t("الشجر في الباقة", "Trees in the bundle") : t("النباتات في الباقة", "Plants in the bundle")}</h2>
          <p className="mt-1 text-sm text-moss">
            {t("حدد العدد من كل نوع. الأنواع بتتضاف وتتعدل من صفحة النباتات والشجر.", "Set how many of each. Add or edit varieties on the plants and trees page.")}
          </p>
          <ul className="mt-4 divide-y divide-line-soft">
            {options.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <li key={item.id} className={`flex items-center gap-3 py-2.5 ${qty ? "" : "opacity-75"}`}>
                  <Thumb src={item.imageUrl} alt="" service={service} className="h-11 w-11 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {pick(lang, item.nameAr, item.nameEn)}
                      {!item.isActive && <span className="ms-2 text-xs font-normal text-moss">({t("مخفي", "hidden")})</span>}
                    </p>
                    <p className="num text-xs text-moss">
                      {pick(lang, KIND_LABELS[item.kind].ar, KIND_LABELS[item.kind].en)}
                      {item.price !== null && ` — ${formatMoney(item.price, lang)}`}
                    </p>
                  </div>
                  <div className="inline-flex h-9 items-center rounded-lg border border-line">
                    <button type="button" onClick={() => setQty(item.id, qty - 1)} disabled={!qty} className="grid h-full w-8 place-items-center disabled:text-sage" aria-label={t("أقل", "Fewer")}>
                      <MinusIcon size={15} />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => setQty(item.id, Number(e.target.value) || 0)}
                      className="num h-full w-14 border-x border-line text-center text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={t(`عدد ${item.nameAr}`, `Number of ${item.nameEn}`)}
                    />
                    <button type="button" onClick={() => setQty(item.id, qty + 1)} className="grid h-full w-8 place-items-center" aria-label={t("أكتر", "More")}>
                      <PlusIcon size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {options.length === 0 && (
            <p className="mt-4 text-sm text-moss">{t("ضيف أنواع من صفحة النباتات والشجر الأول.", "Add varieties on the plants and trees page first.")}</p>
          )}
        </section>
      </div>

      <div className="space-y-6 xl:sticky xl:top-6">
        <section className="space-y-5 rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6">
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="num">
              <span className="font-bold">{formatNumber(totals.count, lang)}</span> {planting ? t("شجرة", "trees") : t("نبات", "plants")}
            </p>
            {totals.separate !== null && (
              <p className="num mt-1 text-moss">
                {t("سعرهم بالقطعة:", "Priced one by one:")} {formatMoney(totals.separate, lang)}
              </p>
            )}
            {planting && (
              <p className="num mt-1 text-moss">
                {t("رسوم زراعتهم:", "Planting fee for them:")} {formatMoney(totals.plantingFee, lang)}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="price" className="label">{t("سعر الباقة (ج.م)", "Bundle price (EGP)")}</label>
            <input id="price" type="number" min={1} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} required className="field num" />
            {totals.separate !== null && Number(form.price) > totals.separate && (
              <p className="hint text-harvest-deep">{t("السعر أعلى من شراء نفس الشجر بالقطعة.", "This is more than buying the same trees one by one.")}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="areaMin" className="label">{t("من (م²)", "From (m²)")}</label>
              <input id="areaMin" type="number" min={0} value={form.areaMin} onChange={(e) => set("areaMin", e.target.value)} className="field num" />
            </div>
            <div>
              <label htmlFor="areaMax" className="label">{t("إلى (م²)", "To (m²)")}</label>
              <input id="areaMax" type="number" min={0} value={form.areaMax} onChange={(e) => set("areaMax", e.target.value)} className="field num" />
            </div>
            <p className="hint col-span-2 !mt-0">{t("الفدان = ٤٢٠٠ م². المسطرة في الموقع بتستخدم المساحة دي.", "1 feddan = 4,200 m². The area ruler on the site uses this range.")}</p>
          </div>
          <fieldset>
            <legend className="label">{t("مناسبة لـ", "Suited to")}</legend>
            <div className="flex flex-wrap gap-2">
              {audiences.map((a) => (
                <label key={a.value} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-canopy has-[:checked]:bg-mist">
                  <input
                    type="checkbox"
                    checked={form.audiences.includes(a.value)}
                    onChange={(e) => set("audiences", e.target.checked ? [...form.audiences, a.value] : form.audiences.filter((x) => x !== a.value))}
                    className="h-3.5 w-3.5 accent-[var(--color-canopy)]"
                  />
                  {pick(lang, a.ar, a.en)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <label htmlFor="extrasAr" className="label">{t("مميزات إضافية بالعربي (سطر لكل ميزة)", "Extras in Arabic (one per line)")}</label>
              <textarea id="extrasAr" dir="rtl" rows={3} value={form.extrasAr} onChange={(e) => set("extrasAr", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="extrasEn" className="label">{t("مميزات إضافية بالإنجليزي", "Extras in English")}</label>
              <textarea id="extrasEn" dir="ltr" rows={3} value={form.extrasEn} onChange={(e) => set("extrasEn", e.target.value)} className="field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sortOrder" className="label">{t("الترتيب", "Order")}</label>
              <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="field num" />
            </div>
            <div>
              <label htmlFor="slug" className="label">{t("رابط الصفحة", "Page link")}</label>
              <input id="slug" dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="field text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-sm font-semibold">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-[var(--color-canopy)]" />
              {t("ظاهرة في المتجر", "Shown in the store")}
            </label>
            <label className="flex items-center gap-2.5 text-sm font-semibold">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-[var(--color-canopy)]" />
              {t("اختيار جنان (مميزة)", "Genaan's pick (featured)")}
            </label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className="btn btn-primary flex-1">
              {pending ? t("بنحفظ…", "Saving…") : t("احفظ الباقة", "Save bundle")}
            </button>
            {bundle && (
              <button type="button" onClick={remove} disabled={pending} className="btn btn-outline text-danger">
                {t("احذف", "Delete")}
              </button>
            )}
          </div>
        </section>
      </div>
    </form>
  );
}
