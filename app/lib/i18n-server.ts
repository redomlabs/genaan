import { cookies } from "next/headers";
import { cache } from "react";
import type { Lang } from "./types";

export const LANG_COOKIE = "genaan_lang";

/** Arabic unless the visitor switched to English. */
export const getLang = cache(async (): Promise<Lang> => {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return value === "en" ? "en" : "ar";
});

/** Returns a picker for inline bilingual copy: t("عربي", "English"). */
export async function getT() {
  const lang = await getLang();
  return { lang, t: (ar: string, en: string) => (lang === "ar" ? ar : en) };
}
