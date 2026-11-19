"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatMoney } from "../../lib/format";
import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { BagIcon, CloseIcon, ShovelIcon, TrashIcon } from "../icons";
import { Thumb } from "./Thumb";

export function CartDrawer() {
  const { t, lang } = useLang();
  const { entries, isOpen, close, setQuantity, setPlanting, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;
  const subtotal = entries.reduce((s, e) => s + e.unitPrice * e.quantity, 0);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" className="absolute inset-0 bg-forest-deep/50" onClick={close} aria-label={t("أغلق السلة", "Close cart")} />
      <aside className="drawer-panel absolute inset-y-0 end-0 flex w-[min(28rem,100vw)] flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 id="cart-title" className="text-lg font-bold">
            {t("السلة", "Your cart")}
          </h2>
          <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-mist" aria-label={t("أغلق السلة", "Close cart")}>
            <CloseIcon />
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <BagIcon size={40} className="text-sage" />
            <p className="max-w-60 text-sm leading-7 text-moss">
              {t("السلة فاضية. اختار باقة لمكانك أو شجر لأرضك.", "Your cart is empty. Pick a bundle for your space or trees for your land.")}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/business" onClick={close} className="btn btn-outline btn-sm">
                {t("باقات الأماكن", "Workplace bundles")}
              </Link>
              <Link href="/planting" onClick={close} className="btn btn-outline btn-sm">
                {t("الشجر والزراعة", "Trees and planting")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line-soft overflow-y-auto px-5">
              {entries.map((e) => {
                const name = lang === "ar" ? e.nameAr : e.nameEn;
                return (
                  <li key={`${e.type}-${e.id}`} className="flex gap-3 py-4">
                    <Thumb src={e.imageUrl} alt="" service={e.service} className="h-20 w-20 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-6">{name}</p>
                        <button
                          type="button"
                          onClick={() => remove(e.type, e.id)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-moss hover:bg-mist hover:text-danger"
                          aria-label={t(`احذف ${name}`, `Remove ${name}`)}
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                      <p className="num text-sm text-moss">{formatMoney(e.unitPrice, lang)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <QuantityStepper size="sm" value={e.quantity} onChange={(q) => setQuantity(e.type, e.id, q)} label={name} />
                        {e.plantable && (
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={e.planting}
                              onChange={(ev) => setPlanting(e.type, e.id, ev.target.checked)}
                              className="h-4 w-4 accent-[var(--color-canopy)]"
                            />
                            <ShovelIcon size={16} className="text-harvest" />
                            {t("مع الزراعة", "Plant it for me")}
                          </label>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line-soft bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-moss">{t("إجمالي المنتجات", "Products")}</span>
                <span className="num text-lg font-bold">{formatMoney(subtotal, lang)}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-moss">
                {t("التوصيل والزراعة بيتحسبوا في الخطوة الجاية حسب منطقتك.", "Delivery and planting are added at checkout based on your area.")}
              </p>
              <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
                {t("كمّل الطلب", "Continue to checkout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
