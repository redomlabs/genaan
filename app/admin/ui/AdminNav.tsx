"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "../actions";
import { useLang } from "../../components/LangProvider";
import { Logo } from "../../components/Logo";
import {
  BoxIcon,
  CloseIcon,
  ExternalIcon,
  GridIcon,
  InboxIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  SproutIcon,
  TruckIcon,
  BagIcon,
} from "../../components/icons";

export function AdminNav({ name, badges }: { name: string; badges: { orders: number; enquiries: number } }) {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigation
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/admin", label: t("نظرة عامة", "Overview"), Icon: GridIcon, exact: true },
    { href: "/admin/orders", label: t("الطلبات", "Orders"), Icon: BagIcon, badge: badges.orders },
    { href: "/admin/bundles", label: t("الباقات", "Bundles"), Icon: BoxIcon },
    { href: "/admin/catalog", label: t("النباتات والشجر", "Plants and trees"), Icon: SproutIcon },
    { href: "/admin/fees", label: t("التوصيل والزراعة", "Delivery and planting"), Icon: TruckIcon },
    { href: "/admin/enquiries", label: t("طلبات العروض", "Quote requests"), Icon: InboxIcon, badge: badges.enquiries },
    { href: "/admin/settings", label: t("الإعدادات", "Settings"), Icon: SettingsIcon },
  ];
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label={t("لوحة التحكم", "Dashboard")} className="flex flex-1 flex-col gap-1">
      {links.map(({ href, label, Icon, exact, badge }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href, exact) ? "page" : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-mint/85 hover:bg-white/5 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
        >
          <Icon size={19} />
          <span className="flex-1">{label}</span>
          {!!badge && <span className="num rounded-full bg-harvest px-2 py-0.5 text-xs text-white">{badge}</span>}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mint/85 hover:bg-white/5 hover:text-white">
          <ExternalIcon size={19} /> {t("افتح المتجر", "Open the store")}
        </a>
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mint/85 hover:bg-white/5 hover:text-white"
        >
          <span className="grid w-[19px] place-items-center text-xs font-bold">{lang === "ar" ? "EN" : "ع"}</span>
          {lang === "ar" ? "English" : "عربي"}
        </button>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mint/85 hover:bg-white/5 hover:text-white">
            <LogoutIcon size={19} /> {t("خروج", "Sign out")}
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-sage">{name}</p>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-forest px-4 lg:hidden">
        <Logo tone="light" size="sm" />
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-white" aria-label={t("القائمة", "Menu")}>
          <MenuIcon />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-forest-deep/50" onClick={() => setOpen(false)} aria-label={t("إغلاق", "Close")} />
          <div className="drawer-panel absolute inset-y-0 end-0 flex w-72 flex-col bg-forest p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo tone="light" size="sm" />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center text-white" aria-label={t("إغلاق", "Close")}>
                <CloseIcon />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-forest p-4 lg:flex">
        <Link href="/admin" className="mb-8 px-2 pt-2">
          <Logo tone="light" />
        </Link>
        {nav}
      </aside>
    </>
  );
}
