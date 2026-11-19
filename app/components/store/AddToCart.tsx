"use client";

import { useState } from "react";
import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { CheckIcon, PlusIcon, ShovelIcon } from "../icons";
import { formatMoney } from "../../lib/format";

type Product = {
  type: "bundle" | "item";
  id: number;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  service: "business" | "planting";
};

/** One-tap add for bundles. */
export function AddBundleButton({ product, className = "" }: { product: Product; className?: string }) {
  const { t } = useLang();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      className={`btn ${product.service === "planting" ? "btn-harvest" : "btn-primary"} ${className}`}
      onClick={() => {
        add({
          type: product.type,
          id: product.id,
          quantity: 1,
          planting: product.service === "planting",
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          plantable: product.service === "planting",
          service: product.service,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
    >
      {added ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
      {added ? t("اتضافت للسلة", "Added to cart") : t("أضف للسلة", "Add to cart")}
    </button>
  );
}

/** Quantity, planting choice and add, for trees and for bundle detail pages. */
export function AddWithOptions({
  product,
  plantingFeePerUnit,
  compact = false,
}: {
  product: Product;
  plantingFeePerUnit: number | null;
  compact?: boolean;
}) {
  const { t, lang } = useLang();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [planting, setPlanting] = useState(product.service === "planting");
  const [added, setAdded] = useState(false);
  const plantable = product.service === "planting";
  const name = lang === "ar" ? product.nameAr : product.nameEn;

  return (
    <div className="space-y-3">
      {plantable && plantingFeePerUnit !== null && (
        <label className="flex items-start gap-2.5 rounded-xl bg-harvest-soft/70 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={planting}
            onChange={(e) => setPlanting(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-harvest-deep)]"
          />
          <span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <ShovelIcon size={16} className="text-harvest-deep" />
              {t("ازرعها لي", "Plant it for me")}
            </span>
            <span className="num block text-xs text-moss">
              {plantingFeePerUnit > 0
                ? t(`+ ${formatMoney(plantingFeePerUnit, lang)} للوحدة`, `+ ${formatMoney(plantingFeePerUnit, lang)} each`)
                : t("الزراعة بدون رسوم إضافية", "Planting at no extra cost")}
            </span>
          </span>
        </label>
      )}
      <div className={`flex gap-2 ${compact ? "" : "flex-wrap"}`}>
        <QuantityStepper value={quantity} onChange={setQuantity} label={name} />
        <button
          type="button"
          className={`btn flex-1 whitespace-nowrap ${compact ? "!px-3" : ""} ${plantable ? "btn-harvest" : "btn-primary"}`}
          onClick={() => {
            add({
              type: product.type,
              id: product.id,
              quantity,
              planting: plantable && planting,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              imageUrl: product.imageUrl,
              unitPrice: product.price,
              plantable,
              service: product.service,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
        >
          {added ? <CheckIcon size={18} /> : !compact && <PlusIcon size={18} />}
          {added ? t("اتضافت", "Added") : t("أضف للسلة", "Add to cart")}
        </button>
      </div>
    </div>
  );
}
