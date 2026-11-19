import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByToken, getSettings } from "../../../lib/data";
import { getLang, getT } from "../../../lib/i18n-server";
import { formatDate, formatMoney, formatNumber, pick, whatsappLink } from "../../../lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../../../lib/types";
import { CheckIcon, WhatsAppIcon } from "../../../components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "طلبك", "Your order"), robots: { index: false, follow: false } };
}

const FLOW: OrderStatus[] = ["new", "confirmed", "scheduled", "completed"];

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [{ t, lang }, order, settings] = await Promise.all([getT(), getOrderByToken(token), getSettings()]);
  if (!order) notFound();

  const cancelled = order.status === "cancelled";
  const step = FLOW.indexOf(order.status);
  const wa = whatsappLink(
    settings.whatsapp,
    t(`أهلًا جنان، ده طلبي رقم ${order.code}.`, `Hello Genaan, this is my order ${order.code}.`),
  );

  return (
    <div className="container-page max-w-4xl py-10 md:py-14">
      <div className="rounded-[var(--radius-panel)] bg-forest p-6 text-white md:p-10">
        <p className="text-sm text-mint">{t("رقم الطلب", "Order number")}</p>
        <p className="num mt-1 text-4xl font-bold tracking-wide md:text-5xl" dir="ltr">
          {order.code}
        </p>
        <h1 className="mt-6 text-2xl font-bold md:text-3xl">
          {cancelled
            ? t("الطلب ده اتلغى.", "This order was cancelled.")
            : order.status === "new"
              ? t(`شكرًا ${order.customerName}، طلبك وصلنا.`, `Thank you, ${order.customerName}. We have your order.`)
              : pick(lang, ORDER_STATUS_LABELS[order.status].ar, ORDER_STATUS_LABELS[order.status].en)}
        </h1>
        {!cancelled && order.status === "new" && (
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
            {t(
              "هنكلمك على الموبايل اللي سجلته نأكد التفاصيل وميعاد التوصيل. احتفظ برقم الطلب علشان تتابعه.",
              "We'll call the mobile number you gave us to confirm the details and delivery date. Keep your order number to track it.",
            )}
          </p>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-6">
            <WhatsAppIcon size={18} />
            {t("كلمنا على واتساب", "Message us on WhatsApp")}
          </a>
        )}
      </div>

      {!cancelled && (
        <ol className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label={t("حالة الطلب", "Order progress")}>
          {FLOW.map((s, i) => {
            const done = i <= step;
            return (
              <li
                key={s}
                aria-current={i === step ? "step" : undefined}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm ${done ? "border-canopy bg-mist font-semibold" : "border-line-soft bg-white text-moss"}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-canopy text-white" : "border border-line"}`}>
                  {done ? <CheckIcon size={14} /> : <span className="num text-xs">{formatNumber(i + 1, lang)}</span>}
                </span>
                {pick(lang, ORDER_STATUS_LABELS[s].ar, ORDER_STATUS_LABELS[s].en)}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[var(--radius-panel)] bg-white p-6" aria-labelledby="items-heading">
          <h2 id="items-heading" className="text-lg font-bold">{t("تفاصيل الطلب", "Order details")}</h2>
          <ul className="mt-4 divide-y divide-line-soft">
            {order.lines.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">
                    {pick(lang, l.nameAr, l.nameEn)} <span className="num text-moss">×{formatNumber(l.quantity, lang)}</span>
                  </span>
                  <span className="num font-semibold">{formatMoney(l.lineTotal, lang)}</span>
                </div>
                {l.withPlanting && (
                  <p className="num mt-0.5 text-sm text-harvest-deep">
                    {t(`مع الزراعة: ${formatMoney(l.plantingFee, lang)}`, `With planting: ${formatMoney(l.plantingFee, lang)}`)}
                  </p>
                )}
                {l.contents.length > 0 && (
                  <p className="mt-1 text-xs leading-5 text-moss">
                    {l.contents.map((c) => `${formatNumber(c.quantity, lang)} ${pick(lang, c.nameAr, c.nameEn)}`).join(t("، ", ", "))}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <dl className="num mt-4 space-y-2 border-t border-line-soft pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-moss">{t("المنتجات", "Products")}</dt><dd>{formatMoney(order.subtotal, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-moss">{t("التوصيل", "Delivery")}</dt><dd>{order.deliveryFee ? formatMoney(order.deliveryFee, lang) : t("مجاني", "Free")}</dd></div>
            {order.plantingFee > 0 && (
              <div className="flex justify-between"><dt className="text-moss">{t("الزراعة", "Planting")}</dt><dd>{formatMoney(order.plantingFee, lang)}</dd></div>
            )}
            <div className="flex justify-between border-t border-line-soft pt-3 text-base font-bold"><dt>{t("الإجمالي", "Total")}</dt><dd>{formatMoney(order.total, lang)}</dd></div>
          </dl>
        </section>
        <section className="rounded-[var(--radius-panel)] bg-white p-6 text-sm" aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="text-lg font-bold">{t("التوصيل", "Delivery")}</h2>
          <dl className="mt-4 space-y-3">
            <div><dt className="text-moss">{t("المنطقة", "Area")}</dt><dd className="font-semibold">{pick(lang, order.zoneNameAr, order.zoneNameEn)}</dd></div>
            <div><dt className="text-moss">{t("العنوان", "Address")}</dt><dd className="font-semibold">{order.address}</dd></div>
            {order.preferredDate && (
              <div><dt className="text-moss">{t("الميعاد المفضل", "Preferred date")}</dt><dd className="font-semibold">{formatDate(new Date(order.preferredDate), lang)}</dd></div>
            )}
            <div><dt className="text-moss">{t("الدفع", "Payment")}</dt><dd className="font-semibold">{order.paymentMethod === "cod" ? t("كاش عند الاستلام", "Cash on delivery") : t("تحويل بعد التأكيد", "Transfer after confirmation")}</dd></div>
            <div><dt className="text-moss">{t("تاريخ الطلب", "Ordered")}</dt><dd className="font-semibold">{formatDate(order.createdAt, lang, true)}</dd></div>
          </dl>
        </section>
      </div>

      <p className="mt-8 text-center text-sm text-moss">
        <Link href="/" className="font-semibold text-canopy hover:underline">{t("رجوع للرئيسية", "Back to home")}</Link>
      </p>
    </div>
  );
}
