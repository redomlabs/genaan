"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteItem, saveItem, type ItemInput } from "../actions";
import { useLang } from "../../components/LangProvider";
import { formatMoney, pick } from "../../lib/format";
import { KIND_LABELS, PLANTING_KINDS, type CatalogItem, type ItemKind } from "../../lib/types";
import { ImageField } from "./ImageField";

export function ItemForm({
  item,
  defaultKind,
  plantingFeePerTree,
}: {
  item: CatalogItem | null;
  defaultKind: ItemKind;
  plantingFeePerTree: number;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<ItemInput>({
    id: item?.id,
    kind: item?.kind ?? defaultKind,
    slug: item?.slug ?? "",
    nameAr: item?.nameAr ?? "",
    nameEn: item?.nameEn ?? "",
    descriptionAr: item?.descriptionAr ?? "",
    descriptionEn: item?.descriptionEn ?? "",
    sizeAr: item?.sizeAr ?? "",
    sizeEn: item?.sizeEn ?? "",
    imageUrl: item?.imageUrl ?? "",
    price: item?.price != null ? String(item.price) : "",
    plantingFee: item?.plantingFee != null ? String(item.plantingFee) : "",
    areaPerUnit: item?.areaPerUnit != null ? String(item.areaPerUnit) : "",
    isActive: item?.isActive ?? true,
    sortOrder: item ? String(item.sortOrder) : "0",
  });
  const set = <K extends keyof ItemInput>(key: K, value: ItemInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const sellable = PLANTING_KINDS.includes(form.kind);
  const back = () => {
    router.push(`/admin/catalog?kind=${form.kind}`);
    router.refresh();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const result = await saveItem(form);
          if (result.error) setError(result.error);
          else back();
        });
      }}
      className="max-w-3xl space-y-6 rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6"
    >
      <fieldset>
        <legend className="label">{t("النوع", "Type")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["fruit", "ornamental", "indoor", "palm"] as ItemKind[]).map((k) => (
            <label key={k} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-white">
              <input type="radio" name="kind" checked={form.kind === k} onChange={() => set("kind", k)} className="sr-only" />
              {pick(lang, KIND_LABELS[k].ar, KIND_LABELS[k].en)}
            </label>
          ))}
        </div>
        <p className="hint">
          {sellable
            ? t("بيتباع بالشجرة في كتالوج الزراعة، وممكن يدخل في باقات الزراعة.", "Sold per tree in the planting catalogue and usable in planting bundles.")
            : t("بيستخدم جوه باقات الأماكن بس، ومش بيتباع لوحده.", "Used inside workplace bundles only, not sold on its own.")}
        </p>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="i-nameAr" className="label">{t("الاسم بالعربي", "Name in Arabic")}</label>
          <input id="i-nameAr" dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} required className="field" />
        </div>
        <div>
          <label htmlFor="i-nameEn" className="label">{t("الاسم بالإنجليزي", "Name in English")}</label>
          <input id="i-nameEn" dir="ltr" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required className="field" />
        </div>
        <div>
          <label htmlFor="i-sizeAr" className="label">{t("الحجم أو العمر بالعربي", "Size or age in Arabic")}</label>
          <input id="i-sizeAr" dir="rtl" value={form.sizeAr} onChange={(e) => set("sizeAr", e.target.value)} placeholder="عمر سنتين، ارتفاع متر" className="field" />
        </div>
        <div>
          <label htmlFor="i-sizeEn" className="label">{t("الحجم أو العمر بالإنجليزي", "Size or age in English")}</label>
          <input id="i-sizeEn" dir="ltr" value={form.sizeEn} onChange={(e) => set("sizeEn", e.target.value)} placeholder="2 years, 1 m" className="field" />
        </div>
        <div>
          <label htmlFor="i-descAr" className="label">{t("وصف قصير بالعربي", "Short description in Arabic")}</label>
          <textarea id="i-descAr" dir="rtl" rows={2} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="i-descEn" className="label">{t("وصف قصير بالإنجليزي", "Short description in English")}</label>
          <textarea id="i-descEn" dir="ltr" rows={2} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="field" />
        </div>
      </div>

      <ImageField label={t("الصورة", "Photo")} value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="i-price" className="label">
            {t("السعر للشجرة (ج.م)", "Price per tree (EGP)")}
            {!sellable && <span className="font-normal text-moss"> {t("اختياري", "optional")}</span>}
          </label>
          <input id="i-price" type="number" min={0} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} required={sellable} className="field num" />
        </div>
        {sellable && (
          <>
            <div>
              <label htmlFor="i-fee" className="label">{t("رسوم زراعتها (ج.م)", "Planting fee (EGP)")}</label>
              <input id="i-fee" type="number" min={0} inputMode="numeric" value={form.plantingFee} onChange={(e) => set("plantingFee", e.target.value)} placeholder={String(plantingFeePerTree)} className="field num" />
              <p className="hint num">{t(`فاضي = الرسوم العامة ${formatMoney(plantingFeePerTree, lang)}`, `Empty uses the standard ${formatMoney(plantingFeePerTree, lang)}`)}</p>
            </div>
            <div>
              <label htmlFor="i-area" className="label">{t("مساحة الشجرة (م²)", "Space per tree (m²)")}</label>
              <input id="i-area" type="number" min={0} step="0.5" value={form.areaPerUnit} onChange={(e) => set("areaPerUnit", e.target.value)} className="field num" />
              <p className="hint">{t("مثلًا ٦×٦ م = ٣٦. بتستخدم لحساب عدد الشجر للمساحة.", "E.g. 6 × 6 m = 36. Used to estimate trees per area.")}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="i-sort" className="label">{t("الترتيب", "Order")}</label>
          <input id="i-sort" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="field num" />
        </div>
        <div className="sm:col-span-2 sm:self-end">
          <label className="flex items-center gap-2.5 py-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-[var(--color-canopy)]" />
            {t("ظاهر في المتجر", "Shown in the store")}
          </label>
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? t("بنحفظ…", "Saving…") : t("احفظ", "Save")}
        </button>
        {item && (
          <button
            type="button"
            disabled={pending}
            className="btn btn-outline text-danger"
            onClick={() => {
              if (!confirm(t("تحذف النوع ده؟", "Delete this variety?"))) return;
              startTransition(async () => {
                const result = await deleteItem(item.id);
                if (result.error) setError(result.error);
                else back();
              });
            }}
          >
            {t("احذف", "Delete")}
          </button>
        )}
      </div>
    </form>
  );
}
