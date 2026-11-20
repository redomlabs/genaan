"use client";

import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { ShovelIcon } from "../icons";

/** One choice for the whole order: plant every tree, or deliver only. Hidden when nothing can be planted. */
export function PlantingSwitch({ detail }: { detail?: React.ReactNode }) {
  const { t } = useLang();
  const { entries, plantAll, setPlantAll } = useCart();
  if (!entries.some((e) => e.plantable)) return null;
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-harvest-soft/70 p-3 text-sm">
      <input
        type="checkbox"
        checked={plantAll}
        onChange={(e) => setPlantAll(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-harvest-deep)]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-semibold">
          <ShovelIcon size={16} className="text-harvest-deep" />
          {t("ازرعولي الشجر", "Plant the trees for me")}
        </span>
        <span className="block text-xs leading-5 text-moss">
          {plantAll
            ? t("فريقنا هيزرع كل الشجر في الطلب.", "Our team plants every tree in the order.")
            : t("توصيل بس، وإنت هتزرع بنفسك.", "Delivery only. You plant them yourself.")}
        </span>
        {detail}
      </span>
    </label>
  );
}
