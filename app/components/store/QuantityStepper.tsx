"use client";

import { MAX_LINE_QUANTITY } from "../../lib/pricing";
import { MinusIcon, PlusIcon } from "../icons";
import { useLang } from "../LangProvider";

export function QuantityStepper({
  value,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const { t } = useLang();
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={`inline-flex ${h} items-center rounded-[var(--radius-control)] border border-line bg-white`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="grid h-full w-9 place-items-center text-forest disabled:text-sage"
        aria-label={t(`تقليل ${label}`, `Fewer ${label}`)}
      >
        <MinusIcon size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_LINE_QUANTITY}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        className="num h-full w-12 border-x border-line bg-transparent text-center text-sm font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={t(`عدد ${label}`, `Number of ${label}`)}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_LINE_QUANTITY, value + 1))}
        className="grid h-full w-9 place-items-center text-forest"
        aria-label={t(`زيادة ${label}`, `More ${label}`)}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
