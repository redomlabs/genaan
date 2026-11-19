import Link from "next/link";
import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb, schema } from "../../../lib/db";
import { getT } from "../../../lib/i18n-server";
import { formatDate, formatMoney, normalizePhone, pick } from "../../../lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../../../lib/types";
import { Empty, PageHeader, StatusBadge } from "../../ui/bits";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const [{ t, lang }, params] = await Promise.all([getT(), searchParams]);
  const status = STATUSES.find((s) => s === params.status);
  const q = (params.q ?? "").trim().slice(0, 60);
  const phone = normalizePhone(q);
  const search = q
    ? or(
        like(schema.orders.code, `%${q.toUpperCase()}%`),
        like(schema.orders.customerName, `%${q}%`),
        phone ? eq(schema.orders.phone, phone) : like(schema.orders.phone, `%${q.replace(/\D/g, "") || "-"}%`),
      )
    : undefined;
  const orders = await getDb()
    .select()
    .from(schema.orders)
    .where(and(status ? eq(schema.orders.status, status) : undefined, search))
    .orderBy(desc(schema.orders.createdAt))
    .limit(200);

  const tab = (value?: OrderStatus) => {
    const qs = new URLSearchParams();
    if (value) qs.set("status", value);
    if (q) qs.set("q", q);
    return `/admin/orders${qs.size ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader title={t("الطلبات", "Orders")} intro={t("أكّد الطلبات الجديدة بمكالمة، وحدّث حالتها علشان العميل يتابعها.", "Confirm new orders by phone and update their status so customers can follow along.")} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label={t("فلتر الحالة", "Status filter")} className="flex flex-wrap gap-2">
          {[undefined, ...STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={tab(s)}
              aria-current={status === s ? "true" : undefined}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold aria-[current=true]:border-forest aria-[current=true]:bg-forest aria-[current=true]:text-white"
            >
              {s ? pick(lang, ORDER_STATUS_LABELS[s].ar, ORDER_STATUS_LABELS[s].en) : t("الكل", "All")}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder={t("رقم الطلب، الاسم أو الموبايل", "Order number, name or mobile")} className="field !min-h-10 w-64" aria-label={t("بحث", "Search")} />
          <button type="submit" className="btn btn-outline btn-sm">{t("بحث", "Search")}</button>
        </form>
      </div>

      {orders.length === 0 ? (
        <Empty>{q || status ? t("مفيش طلبات بالفلتر ده.", "No orders match this filter.") : t("لسه مفيش طلبات.", "No orders yet.")}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line-soft bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-paper/60 text-xs text-moss">
              <tr>
                {[t("الطلب", "Order"), t("العميل", "Customer"), t("الموبايل", "Mobile"), t("المنطقة", "Area"), t("الإجمالي", "Total"), t("الحالة", "Status"), t("التاريخ", "Date")].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-paper/40">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="num font-bold text-canopy hover:underline" dir="ltr">{o.code}</Link></td>
                  <td className="px-4 py-3 font-semibold">{o.customerName}</td>
                  <td className="num px-4 py-3" dir="ltr">+{o.phone}</td>
                  <td className="px-4 py-3 text-moss">{pick(lang, o.zoneNameAr, o.zoneNameEn)}</td>
                  <td className="num px-4 py-3 font-semibold">{formatMoney(o.total, lang)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} lang={lang} /></td>
                  <td className="px-4 py-3 text-moss">{formatDate(o.createdAt, lang, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
