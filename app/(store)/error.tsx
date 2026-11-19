"use client";

import { useLang } from "../components/LangProvider";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLang();
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl md:text-4xl">{t("الصفحة ما اتحملتش.", "This page didn't load.")}</h1>
      <p className="mt-4 text-moss">{t("جرّب تاني بعد لحظة. لو المشكلة استمرت كلمنا.", "Try again in a moment. If it keeps happening, contact us.")}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">
        {t("حاول تاني", "Try again")}
      </button>
    </div>
  );
}
