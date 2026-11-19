"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "../lib/types";

type LangContextValue = {
  lang: Lang;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
  setLang: (lang: Lang) => void;
  switching: boolean;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const [switching, startTransition] = useTransition();
  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `genaan_lang=${next}; path=/; max-age=31536000; samesite=lax`;
      startTransition(() => router.refresh());
    },
    [router],
  );
  const t = useCallback((ar: string, en: string) => (lang === "ar" ? ar : en), [lang]);
  return (
    <LangContext.Provider value={{ lang, isRTL: lang === "ar", t, setLang, switching }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside LangProvider");
  return value;
}
