"use client";

import { useActionState } from "react";
import { createEnquiry, trackOrder, type EnquiryState, type TrackState } from "../../actions/orders";
import { useLang } from "../LangProvider";
import { CheckIcon } from "../icons";

export function TrackForm() {
  const { t, lang } = useLang();
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="track-code" className="label">{t("رقم الطلب", "Order number")}</label>
        <input id="track-code" name="code" required dir="ltr" placeholder="GN-XXXXXX" autoComplete="off" className="field num text-start uppercase" />
      </div>
      <div>
        <label htmlFor="track-phone" className="label">{t("الموبايل اللي طلبت بيه", "Mobile number used to order")}</label>
        <input id="track-phone" name="phone" type="tel" inputMode="tel" required dir="ltr" placeholder="01xxxxxxxxx" className="field text-start" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? t("بندوّر…", "Looking…") : t("اعرض الطلب", "Show my order")}
      </button>
    </form>
  );
}

export function EnquiryForm({ topic, area }: { topic: "business" | "planting" | "other"; area?: number }) {
  const { t, lang } = useLang();
  const [state, action, pending] = useActionState<EnquiryState, FormData>(createEnquiry, {});
  if (state.ok) {
    return (
      <div role="status" className="rounded-[var(--radius-card)] bg-mist p-6">
        <CheckIcon size={28} className="text-canopy" />
        <p className="mt-3 text-lg font-bold">{t("وصلتنا رسالتك.", "We have your message.")}</p>
        <p className="mt-1 text-sm leading-7 text-moss">{t("هنكلمك خلال يوم عمل.", "We'll call you within one working day.")}</p>
      </div>
    );
  }
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="lang" value={lang} />
      <fieldset className="sm:col-span-2">
        <legend className="label">{t("محتاج إيه؟", "What do you need?")}</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["business", t("نباتات لمكان شغل", "Plants for a workplace")],
              ["planting", t("زراعة حديقة أو أرض", "Planting a garden or land")],
              ["other", t("حاجة تانية", "Something else")],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="topic" value={value} defaultChecked={value === topic} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-canopy">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="enq-name" className="label">{t("الاسم", "Name")}</label>
        <input id="enq-name" name="name" autoComplete="name" required className="field" aria-invalid={!!e.name} />
        {e.name && <p className="mt-1.5 text-sm text-danger">{e.name}</p>}
      </div>
      <div>
        <label htmlFor="enq-phone" className="label">{t("الموبايل", "Mobile")}</label>
        <input id="enq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required dir="ltr" placeholder="01xxxxxxxxx" className="field text-start" aria-invalid={!!e.phone} />
        {e.phone && <p className="mt-1.5 text-sm text-danger">{e.phone}</p>}
      </div>
      <div>
        <label htmlFor="enq-city" className="label">{t("المدينة أو المنطقة", "City or area")}</label>
        <input id="enq-city" name="city" className="field" />
      </div>
      <div>
        <label htmlFor="enq-area" className="label">{t("المساحة بالمتر (لو تعرفها)", "Area in m² (if known)")}</label>
        <input id="enq-area" name="area" type="number" inputMode="numeric" min={1} defaultValue={area} className="field num" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enq-message" className="label">{t("التفاصيل", "Details")}</label>
        <textarea
          id="enq-message"
          name="message"
          rows={4}
          placeholder={t("نوع المكان أو الأرض، عدد الفروع، الأنواع اللي في بالك…", "The type of space or land, number of branches, trees you have in mind…")}
          className="field"
        />
        {e.message && <p className="mt-1.5 text-sm text-danger">{e.message}</p>}
      </div>
      <div className="hidden" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {e.form && <p role="alert" className="text-sm text-danger sm:col-span-2">{e.form}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2 sm:justify-self-start">
        {pending ? t("بنبعت…", "Sending…") : t("ابعت الطلب", "Send request")}
      </button>
    </form>
  );
}
