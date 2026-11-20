"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { placeOrder, type FieldErrors } from "../../actions/orders";
import { formatMoney, formatNumber, pick } from "../../lib/format";
import { computeQuote } from "../../lib/pricing";
import type { Bundle, CatalogItem, DeliveryZone, PaymentMethod, StoreSettings } from "../../lib/types";
import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { Thumb } from "./Thumb";
import { TrashIcon } from "../icons";
import { PlantingSwitch } from "./PlantingSwitch";

type Fees = Pick<StoreSettings, "plantingFeePerTree" | "plantingVisitFee" | "freeDeliveryThreshold">;

export function CheckoutForm({
  bundles,
  items,
  zones,
  fees,
}: {
  bundles: Bundle[];
  items: CatalogItem[];
  zones: DeliveryZone[];
  fees: Fees;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const { entries, ready, setQuantity, plantAll, remove, clear } = useCart();
  const [zoneId, setZoneId] = useState<number | "">("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const zone = zones.find((z) => z.id === zoneId) ?? null;
  const lines = useMemo(() => entries.map(({ type, id, quantity }) => ({ type, id, quantity, planting: plantAll })), [entries, plantAll]);
  const quote = useMemo(() => computeQuote(lines, { bundles, items }, zone, fees), [lines, bundles, items, zone, fees]);

  if (!ready) return <div className="mt-10 h-64 animate-pulse rounded-[var(--radius-panel)] bg-white" />;

  if (entries.length === 0) {
    return (
      <div className="mt-10 rounded-[var(--radius-panel)] border border-dashed border-line p-10 text-center">
        <p className="text-moss">{t("السلة فاضية. اختار اللي محتاجه وارجع هنا.", "Your cart is empty. Choose what you need, then come back here.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/business" className="btn btn-primary">{t("باقات الأماكن", "Workplace bundles")}</Link>
          <Link href="/planting" className="btn btn-harvest">{t("الشجر والزراعة", "Trees and planting")}</Link>
        </div>
      </div>
    );
  }

  function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    setErrors({});
    startTransition(async () => {
      const result = await placeOrder({
        cart: lines,
        zoneId: Number(zoneId),
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        address: String(data.get("address") ?? ""),
        preferredDate: String(data.get("preferredDate") ?? ""),
        notes: String(data.get("notes") ?? ""),
        paymentMethod: payment,
        website: String(data.get("website") ?? ""),
        lang,
      });
      if (result.ok) {
        clear();
        router.push(`/order/${result.token}`);
      } else {
        setErrors(result.errors);
        const first = Object.keys(result.errors)[0];
        document.getElementById(`field-${first}`)?.focus();
      }
    });
  }

  const err = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p id={`error-${key}`} className="mt-1.5 text-sm text-danger">
        {errors[key]}
      </p>
    ) : null;
  const describedBy = (key: keyof FieldErrors) => (errors[key] ? `error-${key}` : undefined);

  return (
    <form
      noValidate
      onChange={(e) => {
        const key = (e.target as HTMLElement).id?.replace("field-", "") as keyof FieldErrors;
        if (key && errors[key]) {
          setErrors((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
      className="mt-8 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="space-y-8">
        <section aria-labelledby="cart-heading" className="rounded-[var(--radius-panel)] bg-white p-5 md:p-7">
          <h2 id="cart-heading" className="text-xl font-bold">{t("طلبك", "Your order")}</h2>
          {errors.cart && (
            <p id="field-cart" tabIndex={-1} className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-danger">
              {errors.cart}
            </p>
          )}
          <ul className="mt-4 divide-y divide-line-soft">
            {entries.map((e) => {
              const priced = quote.lines.find((l) => l.type === e.type && l.id === e.id);
              const name = pick(lang, e.nameAr, e.nameEn);
              return (
                <li key={`${e.type}-${e.id}`} className="flex gap-4 py-4">
                  <Thumb src={e.imageUrl} alt="" service={e.service} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-6">{name}</p>
                        {!priced && <p className="text-sm text-danger">{t("مبقاش متاح", "No longer available")}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(e.type, e.id)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-moss hover:bg-mist hover:text-danger"
                        aria-label={t(`احذف ${name}`, `Remove ${name}`)}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <QuantityStepper size="sm" value={e.quantity} onChange={(q) => setQuantity(e.type, e.id, q)} label={name} />
                      {priced && <span className="num font-bold">{formatMoney(priced.lineTotal, lang)}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-2">
            <PlantingSwitch
              detail={
                quote.treesToPlant > 0 && (
                  <span className="num mt-1 block text-xs font-semibold text-harvest-deep">
                    {t(`${formatNumber(quote.treesToPlant, lang)} شجرة، ${formatMoney(quote.plantingFee, lang)}`, `${quote.treesToPlant} trees, ${formatMoney(quote.plantingFee, lang)}`)}
                  </span>
                )
              }
            />
          </div>
        </section>

        <section aria-labelledby="details-heading" className="rounded-[var(--radius-panel)] bg-white p-5 md:p-7">
          <h2 id="details-heading" className="text-xl font-bold">{t("بيانات التوصيل", "Delivery details")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="field-name" className="label">{t("الاسم", "Name")}</label>
              <input id="field-name" name="name" autoComplete="name" required className="field" aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="field-phone" className="label">{t("الموبايل", "Mobile")}</label>
              <input id="field-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="01xxxxxxxxx" required className="field text-start" aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="field-zoneId" className="label">{t("منطقة التوصيل", "Delivery area")}</label>
              <select
                id="field-zoneId"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : "")}
                className="field"
                required
                aria-invalid={!!errors.zoneId}
                aria-describedby={describedBy("zoneId")}
              >
                <option value="">{t("اختار منطقتك", "Choose your area")}</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {pick(lang, z.nameAr, z.nameEn)} ({formatMoney(z.fee, lang)})
                  </option>
                ))}
              </select>
              {err("zoneId")}
              <p className="hint">
                {t("منطقتك مش موجودة؟ ", "Area not listed? ")}
                <Link href="/contact" className="font-semibold text-canopy underline">{t("كلمنا", "Contact us")}</Link>
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="field-address" className="label">{t("العنوان بالتفصيل", "Full address")}</label>
              <textarea id="field-address" name="address" autoComplete="street-address" rows={2} required className="field !min-h-0" aria-invalid={!!errors.address} aria-describedby={describedBy("address")} />
              {err("address")}
            </div>
            <div>
              <label htmlFor="field-preferredDate" className="label">{t("ميعاد مناسب (اختياري)", "Preferred date (optional)")}</label>
              <input id="field-preferredDate" name="preferredDate" type="date" className="field" aria-invalid={!!errors.preferredDate} aria-describedby={describedBy("preferredDate")} />
              {err("preferredDate")}
            </div>
            <div>
              <label htmlFor="field-email" className="label">{t("الإيميل (اختياري)", "Email (optional)")}</label>
              <input id="field-email" name="email" type="email" autoComplete="email" dir="ltr" className="field text-start" aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
              {err("email")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="field-notes" className="label">{t("ملاحظات (اختياري)", "Notes (optional)")}</label>
              <textarea
                id="field-notes"
                name="notes"
                rows={3}
                placeholder={t("مثلًا: الدور، نوع التربة، مصدر الري…", "For example: floor, soil type, water source…")}
                className="field"
                aria-invalid={!!errors.notes}
                aria-describedby={describedBy("notes")}
              />
              {err("notes")}
            </div>
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="label">{t("طريقة الدفع", "Payment")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["cod", t("كاش عند الاستلام", "Cash on delivery"), t("تدفع لما الطلب يوصل.", "Pay when the order arrives.")],
                  ["transfer", t("تحويل بعد التأكيد", "Transfer after we confirm"), t("إنستاباي أو فودافون كاش بعد مكالمة التأكيد.", "InstaPay or Vodafone Cash after our confirmation call.")],
                ] as const
              ).map(([value, title, desc]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${payment === value ? "border-canopy bg-mist/60" : "border-line"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="mt-1 h-4 w-4 accent-[var(--color-canopy)]"
                  />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-moss">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside aria-labelledby="summary-heading" className="rounded-[var(--radius-panel)] bg-forest p-6 text-white lg:sticky lg:top-24 md:p-7">
        <h2 id="summary-heading" className="text-xl font-bold">{t("الحساب", "Summary")}</h2>
        <dl className="num mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/75">{t("المنتجات", "Products")}</dt>
            <dd className="font-semibold">{formatMoney(quote.subtotal, lang)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/75">{t("التوصيل", "Delivery")}</dt>
            <dd className="font-semibold">
              {!zone ? t("اختار المنطقة", "Choose an area") : quote.freeDelivery ? t("مجاني", "Free") : formatMoney(quote.deliveryFee, lang)}
            </dd>
          </div>
          {quote.treesToPlant > 0 && (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-white/75">
                  {t(`زراعة ${formatNumber(quote.treesToPlant, lang)} شجرة`, `Planting ${quote.treesToPlant} trees`)}
                </dt>
                <dd className="font-semibold">{formatMoney(quote.plantingFee - quote.plantingVisitFee, lang)}</dd>
              </div>
              {quote.plantingVisitFee > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-white/75">{t("زيارة الزراعة", "Planting visit")}</dt>
                  <dd className="font-semibold">{formatMoney(quote.plantingVisitFee, lang)}</dd>
                </div>
              )}
            </>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-white/15 pt-4">
            <dt className="text-base font-bold">{t("الإجمالي", "Total")}</dt>
            <dd className="text-2xl font-bold">{formatMoney(quote.total, lang)}</dd>
          </div>
        </dl>
        {errors.form && (
          <p id="field-form" tabIndex={-1} role="alert" className="mt-4 rounded-lg bg-white/10 p-3 text-sm">
            {errors.form}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-light mt-6 w-full !min-h-12 text-base">
          {pending ? t("بنبعت الطلب…", "Placing your order…") : t("أكّد الطلب", "Place order")}
        </button>
        <p className="mt-4 text-xs leading-6 text-white/70">
          {t(
            "مفيش دفع دلوقتي. هنكلمك نأكد التفاصيل والميعاد قبل التوصيل.",
            "You won't pay now. We'll call to confirm the details and date before delivery.",
          )}
        </p>
      </aside>
    </form>
  );
}
