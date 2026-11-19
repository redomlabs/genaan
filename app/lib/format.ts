import type { Lang } from "./types";

export const FEDDAN_M2 = 4200;
export const QIRAT_M2 = 175;

export function pick(lang: Lang, ar: string, en: string): string {
  return lang === "ar" ? ar : en;
}

export function formatNumber(value: number, lang: Lang): string {
  return value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
}

export function formatMoney(value: number, lang: Lang): string {
  return lang === "ar" ? `${formatNumber(value, lang)} ج.م` : `EGP ${formatNumber(value, lang)}`;
}

/** Area in m², adding feddan for farmland-sized plots. */
export function formatArea(m2: number, lang: Lang): string {
  if (m2 >= FEDDAN_M2) {
    const feddan = Math.round((m2 / FEDDAN_M2) * 10) / 10;
    return lang === "ar" ? `${formatNumber(feddan, lang)} فدان` : `${formatNumber(feddan, lang)} feddan`;
  }
  return lang === "ar" ? `${formatNumber(m2, lang)} م²` : `${formatNumber(m2, lang)} m²`;
}

/** Area split into number and unit, for large displays where the unit is set smaller. */
export function formatAreaParts(m2: number, lang: Lang): { value: string; unit: string } {
  if (m2 >= FEDDAN_M2) {
    return { value: formatNumber(Math.round((m2 / FEDDAN_M2) * 10) / 10, lang), unit: lang === "ar" ? "فدان" : "feddan" };
  }
  return { value: formatNumber(m2, lang), unit: lang === "ar" ? "متر مربع" : "m²" };
}

export function formatAreaRange(min: number, max: number, lang: Lang): string {
  if (!max) return formatArea(min, lang);
  if (min >= FEDDAN_M2 || max >= FEDDAN_M2) {
    return `${formatArea(min, lang)} – ${formatArea(max, lang)}`;
  }
  return lang === "ar"
    ? `${formatNumber(min, lang)}–${formatNumber(max, lang)} م²`
    : `${formatNumber(min, lang)}–${formatNumber(max, lang)} m²`;
}

export function formatDate(value: Date | number, lang: Lang, withTime = false): string {
  const date = typeof value === "number" ? new Date(value) : value;
  return date.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Cairo",
  });
}

/** Egyptian mobile numbers to international digits, e.g. 01012345678 → 201012345678. */
export function normalizePhone(value: string): string {
  let digits = value.trim().replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^01[0125]\d{8}$/.test(digits)) digits = "2" + digits;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : "";
}

export function whatsappLink(number: string, text?: string): string {
  const phone = normalizePhone(number);
  if (!phone) return "";
  return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
