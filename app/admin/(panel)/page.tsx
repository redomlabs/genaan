import Link from "next/link";
import { and, count, desc, eq, gte, inArray, sum } from "drizzle-orm";
import { getDb, schema } from "../../lib/db";
import { getT } from "../../lib/i18n-server";
import { formatDate, formatMoney, formatNumber } from "../../lib/format";
import { Empty, PageHeader, Panel, StatusBadge } from "../ui/bits";

export default async function AdminOverview() {
  const { t, lang } = await getT();
  const db = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const active = inArray(schema.orders.status, ["confirmed", "scheduled", "completed"]);

  const [[newOrders], [month], [enquiries], recent] = await Promise.all([
    db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "new")),
    db
      .select({ n: count(), total: sum(schema.orders.total) })
      .from(schema.orders)
      .where(and(active, gte(schema.orders.createdAt, monthStart))),
    db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, "new")),
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(8),
  ]);

  const stats = [
    { label: t("طلبات جديدة محتاجة تأكيد", "New orders to confirm"), value: formatNumber(newOrders.n, lang), href: "/admin/orders?status=new" },
    { label: t("طلبات مؤكدة الشهر ده", "Confirmed this month"), value: formatNumber(month.n, lang), href: "/admin/orders" },
    { label: t("قيمتها", "Their value"), value: formatMoney(Number(month.total ?? 0), lang), href: "/admin/orders" },
    { label: t("طلبات عروض أسعار", "Quote requests waiting"), value: formatNumber(enquiries.n, lang), href: "/admin/enquiries" },
  ];

  return (
    <>
      <PageHeader title={t("نظرة عامة", "Overview")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-[var(--radius-card)] border border-line-soft bg-white p-5 hover:border-canopy">
            <p className="text-sm text-moss">{s.label}</p>
            <p className="num mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <Panel className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("آخر الطلبات", "Latest orders")}</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-canopy hover:underline">{t("كل الطلبات", "All orders")}</Link>
        </div>
        {recent.length === 0 ? (
          <Empty>{t("لسه مفيش طلبات. أول ما عميل يطلب هيظهر هنا.", "No orders yet. They'll appear here as soon as a customer orders.")}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-start text-xs text-moss">
                  <th className="pb-2 text-start font-semibold">{t("الطلب", "Order")}</th>
                  <th className="pb-2 text-start font-semibold">{t("العميل", "Customer")}</th>
                  <th className="pb-2 text-start font-semibold">{t("المنطقة", "Area")}</th>
                  <th className="pb-2 text-start font-semibold">{t("الإجمالي", "Total")}</th>
                  <th className="pb-2 text-start font-semibold">{t("الحالة", "Status")}</th>
                  <th className="pb-2 text-start font-semibold">{t("التاريخ", "Date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3"><Link href={`/admin/orders/${o.id}`} className="num font-bold text-canopy hover:underline" dir="ltr">{o.code}</Link></td>
                    <td className="py-3">{o.customerName}</td>
                    <td className="py-3 text-moss">{lang === "ar" ? o.zoneNameAr : o.zoneNameEn}</td>
                    <td className="num py-3 font-semibold">{formatMoney(o.total, lang)}</td>
                    <td className="py-3"><StatusBadge status={o.status} lang={lang} /></td>
                    <td className="py-3 text-moss">{formatDate(o.createdAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
