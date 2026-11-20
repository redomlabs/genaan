"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { useLang } from "../LangProvider";
import { useCart } from "./CartProvider";
import { BagIcon, CloseIcon, MenuIcon } from "../icons";

export function Navbar() {
  const { t, lang, setLang, switching } = useLang();
  const { count, open, ready } = useCart();
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigation
  useEffect(() => setMenuOpen(false), [pathname]);

  const solid = !overHero || scrolled;
  const links = [
    { href: "/business", label: t("باقات الأماكن", "Workplace bundles") },
    { href: "/planting", label: t("زراعة الحدائق والأراضي", "Garden & land planting") },
    { href: "/planting#trees", label: t("أسعار الشجر", "Tree prices") },
    { href: "/seeds", label: t("البذور", "Seeds") },
    { href: "/orders", label: t("طلباتي", "My orders") },
    { href: "/contact", label: t("تواصل معنا", "Contact") },
  ];
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          solid ? "border-b border-line-soft bg-paper/95 backdrop-blur" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={t("جنان، الصفحة الرئيسية", "Genaan home")} className="shrink-0">
            <Logo tone={solid ? "dark" : "light"} />
          </Link>

          <nav
            aria-label={t("القائمة الرئيسية", "Main")}
            className={`hidden items-center gap-1 text-sm font-semibold lg:flex ${solid ? "text-moss" : "text-white/90"}`}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  solid ? "hover:text-forest aria-[current=page]:text-forest" : "hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              disabled={switching}
              lang={lang === "ar" ? "en" : "ar"}
              className={`h-10 rounded-lg px-3 text-sm font-bold transition-colors ${
                solid ? "text-forest hover:bg-mist" : "text-white hover:bg-white/10"
              }`}
            >
              {lang === "ar" ? "English" : "عربي"}
            </button>
            <button
              type="button"
              onClick={open}
              className={`relative grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                solid ? "text-forest hover:bg-mist" : "text-white hover:bg-white/10"
              }`}
              aria-label={t(`السلة، ${count} عنصر`, `Cart, ${count} items`)}
            >
              <BagIcon size={22} />
              {ready && count > 0 && (
                <span className="num absolute -top-0.5 end-0 grid h-5 min-w-5 place-items-center rounded-full bg-harvest px-1 text-[11px] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`grid h-10 w-10 place-items-center rounded-lg lg:hidden ${
                solid ? "text-forest hover:bg-mist" : "text-white hover:bg-white/10"
              }`}
              aria-label={t("افتح القائمة", "Open menu")}
              aria-expanded={menuOpen}
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </header>
      {!overHero && <div className="h-16 shrink-0" aria-hidden="true" />}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("القائمة", "Menu")}>
          <button
            type="button"
            className="absolute inset-0 bg-forest-deep/50"
            onClick={() => setMenuOpen(false)}
            aria-label={t("أغلق القائمة", "Close menu")}
          />
          <div className="drawer-panel absolute inset-y-0 end-0 flex w-[min(20rem,88vw)] flex-col bg-paper p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-mist"
                aria-label={t("أغلق القائمة", "Close menu")}
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col text-base font-semibold">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="border-b border-line-soft py-3.5">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
