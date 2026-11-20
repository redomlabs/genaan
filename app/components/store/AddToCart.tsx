"use client";

import { useState } from "react";
import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { CheckIcon, PlusIcon } from "../icons";

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

/** Quantity and add, for trees, seeds and bundle pages. Planting is chosen once for the whole order. */
export function AddWithOptions({ product, plantable }: { product: Product; plantable?: boolean }) {
  const { t, lang } = useLang();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const canPlant = plantable ?? product.service === "planting";
  const name = lang === "ar" ? product.nameAr : product.nameEn;

  return (
    <div className="flex items-center gap-2">
      <QuantityStepper size="sm" value={quantity} onChange={setQuantity} label={name} />
      <button
        type="button"
        className={`btn btn-sm h-9 flex-1 whitespace-nowrap ${product.service === "planting" ? "btn-harvest" : "btn-primary"}`}
        onClick={() => {
          add({
            type: product.type,
            id: product.id,
            quantity,
            planting: canPlant,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            imageUrl: product.imageUrl,
            unitPrice: product.price,
            plantable: canPlant,
            service: product.service,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
      >
        {added ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
        {added ? t("اتضافت", "Added") : t("أضف للسلة", "Add to cart")}
      </button>
    </div>
  );
}
