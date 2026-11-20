"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyOrders, type OrderSummary } from "../../actions/orders";
import { formatDate, formatMoney, formatNumber, pick } from "../../lib/format";
import { ORDER_STATUS_LABELS } from "../../lib/types";
import { useLang } from "../LangProvider";
import { ChevronIcon } from "../icons";

const KEY = "genaan_my_orders";

function readTokens(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

/** Remembers an order on this device so it shows under "My orders". */
export function RememberOrder({ token }: { token: string }) {
  useEffect(() => {
    try {
      const tokens = [token, ...readTokens().filter((t) => t !== token)].slice(0, 30);
      localStorage.setItem(KEY, JSON.stringify(tokens));
    } catch {
      /* storage unavailable */
    }
  }, [token]);
  return null;
}

const STATUS_STYLE: Record<OrderSummary["status"], string> = {
  new: "bg-harvest-soft text-harvest-deep",
  confirmed: "bg-mist text-canopy",
  scheduled: "bg-[#e3eef7] text-[#1f4f75]",
  completed: "bg-forest text-white",
  cancelled: "bg-[#f3e4e4] text-danger",
};

export function MyOrdersList() {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    const tokens = readTokens();
    if (tokens.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing stored on this device
      setOrders([]);
      return;
    }
    getMyOrders(tokens)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) return <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-white" />;

  if (orders.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center">
        <p className="text-sm text-moss">
          {t("مفيش طلبات متسجلة على الجهاز ده لسه.", "No orders saved on this device yet.")}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/business" className="btn btn-outline btn-sm">{t("باقات الأماكن", "Workplace bundles")}</Link>
          <Link href="/planting" className="btn btn-outline btn-sm">{t("الشجر والزراعة", "Trees and planting")}</Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => {
        const items = o.items.map((i) => `${formatNumber(i.quantity, lang)} ${pick(lang, i.nameAr, i.nameEn)}`).join(t("، ", ", "));
        return (
          <li key={o.token}>
            <Link
              href={`/order/${o.token}`}
              className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line-soft bg-white p-4 hover:border-canopy"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num font-bold" dir="ltr">{o.code}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[o.status]}`}>
                    {pick(lang, ORDER_STATUS_LABELS[o.status].ar, ORDER_STATUS_LABELS[o.status].en)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-moss">{items}</p>
                <p className="num mt-1 text-xs text-moss">{formatDate(o.createdAt, lang)}</p>
              </div>
              <span className="num shrink-0 font-bold">{formatMoney(o.total, lang)}</span>
              <ChevronIcon size={18} className="shrink-0 text-moss" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
