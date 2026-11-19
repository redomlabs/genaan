"use client";

import { useActionState } from "react";
import { updateOrder, type ActionResult } from "../actions";
import { useLang } from "../../components/LangProvider";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/types";

export function OrderStatusForm({ id, status, adminNote }: { id: number; status: OrderStatus; adminNote: string }) {
  const { t, lang } = useLang();
  const [state, action, pending] = useActionState<ActionResult, FormData>(updateOrder, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <fieldset>
        <legend className="label">{t("غيّر الحالة", "Change status")}</legend>
        <div className="grid gap-2">
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm has-[:checked]:border-canopy has-[:checked]:bg-mist/60">
              <input type="radio" name="status" value={s} defaultChecked={s === status} className="h-4 w-4 accent-[var(--color-canopy)]" />
              {lang === "ar" ? ORDER_STATUS_LABELS[s].ar : ORDER_STATUS_LABELS[s].en}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="adminNote" className="label">{t("ملاحظة داخلية", "Internal note")}</label>
        <textarea id="adminNote" name="adminNote" defaultValue={adminNote} rows={4} className="field" placeholder={t("مش بتظهر للعميل", "Not shown to the customer")} />
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.ok && !pending && <p role="status" className="text-sm font-semibold text-canopy">{t("اتحفظ.", "Saved.")}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? t("بنحفظ…", "Saving…") : t("احفظ", "Save")}
      </button>
    </form>
  );
}
