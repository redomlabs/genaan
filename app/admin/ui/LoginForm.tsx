"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "../actions";
import { useLang } from "../../components/LangProvider";

export function LoginForm() {
  const { t } = useLang();
  const [state, action, pending] = useActionState<ActionResult, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label">{t("الإيميل", "Email")}</label>
        <input id="email" name="email" type="email" autoComplete="username" required dir="ltr" className="field text-start" />
      </div>
      <div>
        <label htmlFor="password" className="label">{t("كلمة السر", "Password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required dir="ltr" className="field text-start" />
      </div>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? t("بندخل…", "Signing in…") : t("دخول", "Sign in")}
      </button>
    </form>
  );
}
