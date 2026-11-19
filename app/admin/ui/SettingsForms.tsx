"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteZone, saveSettings, saveZone, setEnquiryStatus, type ActionResult } from "../actions";
import { useLang } from "../../components/LangProvider";
import type { DeliveryZone } from "../../lib/types";

function Feedback({ state, pending }: { state: ActionResult; pending: boolean }) {
  const { t } = useLang();
  if (state.error) return <p role="alert" className="text-sm text-danger">{state.error}</p>;
  if (state.ok && !pending) return <p role="status" className="text-sm font-semibold text-canopy">{t("اتحفظ.", "Saved.")}</p>;
  return null;
}

/** One delivery area: an existing row, or the empty "add" row when zone is null. */
export function ZoneRow({ zone }: { zone: DeliveryZone | null }) {
  const { t } = useLang();
  const router = useRouter();
  const [added, setAdded] = useState(0);
  const [state, action, pending] = useActionState<ActionResult, FormData>(async (prev, data) => {
    const result = await saveZone(prev, data);
    if (result.ok && !zone) {
      setAdded((n) => n + 1);
      router.refresh();
    }
    return result;
  }, {});
  const [removing, startRemove] = useTransition();
  return (
    <form action={action} key={zone ? zone.id : `new-${added}`} className="grid items-end gap-3 border-b border-line-soft py-4 sm:grid-cols-[1fr_1fr_8rem_5rem_auto]">
      {zone && <input type="hidden" name="id" value={zone.id} />}
      <label className="block">
        <span className="label text-xs">{t("المنطقة بالعربي", "Area in Arabic")}</span>
        <input name="nameAr" dir="rtl" defaultValue={zone?.nameAr} required className="field !min-h-10" />
      </label>
      <label className="block">
        <span className="label text-xs">{t("بالإنجليزي", "In English")}</span>
        <input name="nameEn" dir="ltr" defaultValue={zone?.nameEn} required className="field !min-h-10" />
      </label>
      <label className="block">
        <span className="label text-xs">{t("الرسوم (ج.م)", "Fee (EGP)")}</span>
        <input name="fee" type="number" min={0} defaultValue={zone?.fee} required className="field num !min-h-10" />
      </label>
      <label className="block">
        <span className="label text-xs">{t("الترتيب", "Order")}</span>
        <input name="sortOrder" type="number" defaultValue={zone?.sortOrder ?? 0} className="field num !min-h-10" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          <input type="checkbox" name="isActive" defaultChecked={zone?.isActive ?? true} className="h-4 w-4 accent-[var(--color-canopy)]" />
          {t("متاحة", "On")}
        </label>
        <button type="submit" disabled={pending} className={`btn btn-sm ${zone ? "btn-outline" : "btn-primary"}`}>
          {zone ? t("احفظ", "Save") : t("أضف", "Add")}
        </button>
        {zone && (
          <button
            type="button"
            disabled={removing}
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => {
              if (!confirm(t("تحذف المنطقة دي؟", "Delete this area?"))) return;
              startRemove(async () => {
                await deleteZone(zone.id);
                router.refresh();
              });
            }}
          >
            {t("حذف", "Delete")}
          </button>
        )}
      </div>
      <div className="sm:col-span-5 empty:hidden">
        <Feedback state={state} pending={pending} />
      </div>
    </form>
  );
}

type Field = { name: string; label: string; type?: string; dir?: "ltr" | "rtl"; hint?: string; value: string; wide?: boolean };

export function SettingsForm({ group, fields, submitLabel }: { group: "fees" | "contact"; fields: Field[]; submitLabel: string }) {
  const { t } = useLang();
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettings, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="group" value={group} />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
            <label htmlFor={`s-${f.name}`} className="label">{f.label}</label>
            <input
              id={`s-${f.name}`}
              name={f.name}
              type={f.type ?? "text"}
              min={f.type === "number" ? 0 : undefined}
              dir={f.dir}
              defaultValue={f.value}
              className={`field ${f.type === "number" ? "num" : ""} ${f.dir === "ltr" ? "text-start" : ""}`}
            />
            {f.hint && <p className="hint">{f.hint}</p>}
          </div>
        ))}
      </div>
      <Feedback state={state} pending={pending} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t("بنحفظ…", "Saving…") : submitLabel}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const { t } = useLang();
  const [state, action, pending] = useActionState<ActionResult, FormData>(changePassword, {});
  return (
    <form action={action} className="max-w-sm space-y-4" key={state.ok ? "done" : "form"}>
      <div>
        <label htmlFor="pw-current" className="label">{t("كلمة السر الحالية", "Current password")}</label>
        <input id="pw-current" name="current" type="password" autoComplete="current-password" required dir="ltr" className="field text-start" />
      </div>
      <div>
        <label htmlFor="pw-next" className="label">{t("كلمة السر الجديدة", "New password")}</label>
        <input id="pw-next" name="next" type="password" autoComplete="new-password" required minLength={10} dir="ltr" className="field text-start" />
        <p className="hint">{t("١٠ حروف على الأقل. الأجهزة التانية هتخرج تلقائي.", "At least 10 characters. Other devices will be signed out.")}</p>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm font-semibold text-canopy">{t("اتغيرت كلمة السر.", "Password changed.")}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t("بنحفظ…", "Saving…") : t("غيّر كلمة السر", "Change password")}
      </button>
    </form>
  );
}

export function EnquiryToggle({ id, status }: { id: number; status: "new" | "handled" }) {
  const { t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`btn btn-sm ${status === "new" ? "btn-primary" : "btn-outline"}`}
      onClick={() =>
        start(async () => {
          await setEnquiryStatus(id, status === "new" ? "handled" : "new");
          router.refresh();
        })
      }
    >
      {status === "new" ? t("تم التواصل", "Mark as handled") : t("رجّعها جديدة", "Mark as new")}
    </button>
  );
}
