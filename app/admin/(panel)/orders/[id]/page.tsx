import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "../../../../lib/db";
import { getT } from "../../../../lib/i18n-server";
import { formatDate, formatMoney, formatNumber, pick, whatsappLink } from "../../../../lib/format";
import { PageHeader, Panel, StatusBadge } from "../../../ui/bits";
import { OrderStatusForm } from "../../../ui/OrderStatusForm";
import { PhoneIcon, WhatsAppIcon } from "../../../../components/icons";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, lang } = await getT();
  const db = getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, Number(id))).limit(1);
  if (!order) notFound();
  const lines = await db.select().from(schema.orderLines).where(eq(schema.orderLines.orderId, order.id)).orderBy(asc(schema.orderLines.id));
  const customerLang = order.lang === "en" ? "en" : "ar";
  const wa = whatsappLink(
    order.phone,
    customerLang === "ar"
      ? `أهلًا ${order.customerName}، معاك جنان بخصوص طلبك رقم ${order.code}.`
      : `Hello ${order.customerName}, this is Genaan about your order ${order.code}.`,
  );

  return (
    <>
      <p className="mb-3 text-sm">
        <Link href="/admin/orders" className="text-moss hover:text-forest hover:underline">{t("الطلبات", "Orders")}</Link>
      </p>
      <PageHeader
        title={`${t("طلب", "Order")} ${order.code}`}
        intro={formatDate(order.createdAt, lang, true)}
        action={
          <>
            <a href={`tel:+${order.phone}`} className="btn btn-outline btn-sm"><PhoneIcon size={16} /> {t("اتصال", "Call")}</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><WhatsAppIcon size={16} /> {t("واتساب", "WhatsApp")}</a>}
            <a href={`/order/${order.token}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">{t("صفحة العميل", "Customer's page")}</a>
          </>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-3 text-lg font-bold">{t("المنتجات", "Items")}</h2>
            <ul className="divide-y divide-line-soft">
              {lines.map((l) => (
                <li key={l.id} className="py-3">
                  <div className="flex justify-between gap-4">
                    <p className="font-semibold">
                      {pick(lang, l.nameAr, l.nameEn)} <span className="num text-moss">×{formatNumber(l.quantity, lang)}</span>
                      <span className="ms-2 rounded bg-paper px-1.5 py-0.5 text-xs font-normal text-moss">{l.type === "bundle" ? t("باقة", "Bundle") : t("شجرة", "Tree")}</span>
                    </p>
                    <p className="num font-semibold">{formatMoney(l.lineTotal, lang)}</p>
                  </div>
                  <p className="num text-xs text-moss">{formatMoney(l.unitPrice, lang)} {t("للوحدة", "each")}</p>
                  {l.withPlanting && <p className="num mt-1 text-sm text-harvest-deep">{t("مع الزراعة", "With planting")}: {formatMoney(l.plantingFee, lang)}</p>}
                  {l.contents.length > 0 && (
                    <p className="mt-1 text-xs leading-5 text-moss">
                      {l.contents.map((c) => `${formatNumber(c.quantity, lang)} ${pick(lang, c.nameAr, c.nameEn)}`).join(t("، ", ", "))}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <dl className="num mt-3 space-y-1.5 border-t border-line-soft pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-moss">{t("المنتجات", "Products")}</dt><dd>{formatMoney(order.subtotal, lang)}</dd></div>
              <div className="flex justify-between"><dt className="text-moss">{t("التوصيل", "Delivery")}</dt><dd>{formatMoney(order.deliveryFee, lang)}</dd></div>
              <div className="flex justify-between"><dt className="text-moss">{t("الزراعة", "Planting")}</dt><dd>{formatMoney(order.plantingFee, lang)}</dd></div>
              <div className="flex justify-between pt-1 text-base font-bold"><dt>{t("الإجمالي", "Total")}</dt><dd>{formatMoney(order.total, lang)}</dd></div>
            </dl>
          </Panel>
          <Panel>
            <h2 className="mb-3 text-lg font-bold">{t("العميل والتوصيل", "Customer and delivery")}</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-moss">{t("الاسم", "Name")}</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div><dt className="text-moss">{t("الموبايل", "Mobile")}</dt><dd className="num font-semibold" dir="ltr">+{order.phone}</dd></div>
              {order.email && <div><dt className="text-moss">{t("الإيميل", "Email")}</dt><dd className="break-all font-semibold">{order.email}</dd></div>}
              <div><dt className="text-moss">{t("المنطقة", "Area")}</dt><dd className="font-semibold">{pick(lang, order.zoneNameAr, order.zoneNameEn)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-moss">{t("العنوان", "Address")}</dt><dd className="font-semibold">{order.address}</dd></div>
              {order.preferredDate && <div><dt className="text-moss">{t("الميعاد المفضل", "Preferred date")}</dt><dd className="font-semibold">{formatDate(new Date(order.preferredDate), lang)}</dd></div>}
              <div><dt className="text-moss">{t("الدفع", "Payment")}</dt><dd className="font-semibold">{order.paymentMethod === "cod" ? t("كاش عند الاستلام", "Cash on delivery") : t("تحويل بعد التأكيد", "Transfer after confirmation")}</dd></div>
              <div><dt className="text-moss">{t("لغة العميل", "Customer language")}</dt><dd className="font-semibold">{customerLang === "ar" ? "عربي" : "English"}</dd></div>
              {order.notes && <div className="sm:col-span-2"><dt className="text-moss">{t("ملاحظات العميل", "Customer notes")}</dt><dd className="whitespace-pre-line">{order.notes}</dd></div>}
            </dl>
          </Panel>
        </div>
        <Panel className="xl:sticky xl:top-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("الحالة", "Status")}</h2>
            <StatusBadge status={order.status} lang={lang} />
          </div>
          <OrderStatusForm id={order.id} status={order.status} adminNote={order.adminNote} />
        </Panel>
      </div>
    </>
  );
}
