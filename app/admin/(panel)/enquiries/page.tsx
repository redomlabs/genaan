import { desc } from "drizzle-orm";
import { getDb, schema } from "../../../lib/db";
import { getT } from "../../../lib/i18n-server";
import { formatArea, formatDate, whatsappLink } from "../../../lib/format";
import { Empty, PageHeader } from "../../ui/bits";
import { EnquiryToggle } from "../../ui/SettingsForms";
import { PhoneIcon, WhatsAppIcon } from "../../../components/icons";

export default async function EnquiriesPage() {
  const { t, lang } = await getT();
  const enquiries = await getDb().select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(300);
  const topics = {
    business: t("مكان شغل", "Workplace"),
    planting: t("زراعة", "Planting"),
    other: t("أخرى", "Other"),
  };
  return (
    <>
      <PageHeader
        title={t("طلبات عروض الأسعار", "Quote requests")}
        intro={t("رسايل العملاء من صفحة التواصل: مشاريع كبيرة أو باقات مخصوصة.", "Messages from the contact page: large projects and tailored bundles.")}
      />
      {enquiries.length === 0 ? (
        <Empty>{t("مفيش طلبات لسه.", "No requests yet.")}</Empty>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => {
            const wa = whatsappLink(e.phone);
            return (
              <li key={e.id} className={`rounded-[var(--radius-card)] border bg-white p-5 ${e.status === "new" ? "border-harvest" : "border-line-soft"}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold">
                      {e.name}
                      <span className="ms-2 rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-moss">{topics[e.topic]}</span>
                    </p>
                    <p className="num mt-1 text-sm text-moss">
                      <span dir="ltr">+{e.phone}</span>
                      {e.city && <span className="ms-3">{e.city}</span>}
                      {e.area && <span className="ms-3">{formatArea(e.area, lang)}</span>}
                      <span className="ms-3">{formatDate(e.createdAt, lang, true)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:+${e.phone}`} className="btn btn-outline btn-sm"><PhoneIcon size={16} /> {t("اتصال", "Call")}</a>
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><WhatsAppIcon size={16} /> {t("واتساب", "WhatsApp")}</a>}
                    <EnquiryToggle id={e.id} status={e.status} />
                  </div>
                </div>
                {e.message && <p className="mt-3 whitespace-pre-line text-sm leading-7">{e.message}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
