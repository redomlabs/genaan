import type { Metadata } from "next";
import { getSettings } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { normalizePhone, pick, whatsappLink } from "../../lib/format";
import { EnquiryForm } from "../../components/store/Forms";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../../components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "تواصل معنا", "Contact us") };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string; area?: string }> }) {
  const [{ t, lang }, settings, params] = await Promise.all([getT(), getSettings(), searchParams]);
  const topic = params.topic === "business" || params.topic === "planting" ? params.topic : "other";
  const area = Number(params.area) > 0 ? Math.round(Number(params.area)) : undefined;
  const wa = whatsappLink(settings.whatsapp);
  const phone = normalizePhone(settings.phone);
  const address = lang === "ar" ? settings.addressAr : settings.addressEn;
  const channels = [
    phone && { href: `tel:+${phone}`, Icon: PhoneIcon, label: t("اتصل بينا", "Call us"), value: `+${phone}`, ltr: true },
    wa && { href: wa, Icon: WhatsAppIcon, label: t("واتساب", "WhatsApp"), value: t("ابعت رسالة", "Send a message"), ltr: false },
    settings.email && { href: `mailto:${settings.email}`, Icon: MailIcon, label: t("الإيميل", "Email"), value: settings.email, ltr: true },
  ].filter(Boolean) as { href: string; Icon: typeof PhoneIcon; label: string; value: string; ltr: boolean }[];

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display max-w-3xl text-3xl leading-tight md:text-5xl">{t("احكي لنا عن مكانك أو أرضك.", "Tell us about your space or land.")}</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-moss">
        {t(
          "لو الباقات الجاهزة مش مناسبة، أو عندك مشروع كبير، ابعت التفاصيل وهنكلمك نتفق على المعاينة وعرض السعر.",
          "If the ready bundles don't fit, or you have a large project, send us the details and we'll call to arrange a visit and a quote.",
        )}
      </p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[var(--radius-panel)] bg-white p-6 md:p-8">
          <EnquiryForm topic={topic} area={area} />
        </div>
        <div className="space-y-3">
          {channels.map(({ href, Icon, label, value, ltr }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 rounded-[var(--radius-card)] bg-forest p-5 text-white hover:bg-canopy"
            >
              <Icon size={24} className="shrink-0 text-mint" />
              <span>
                <span className="block text-sm text-mint">{label}</span>
                <span className="num block break-all font-semibold" dir={ltr ? "ltr" : undefined}>{value}</span>
              </span>
            </a>
          ))}
          {address && (
            <p className="flex items-start gap-4 rounded-[var(--radius-card)] border border-line-soft bg-white p-5">
              <PinIcon size={24} className="shrink-0 text-canopy" />
              {address}
            </p>
          )}
          {channels.length === 0 && !address && (
            <p className="rounded-[var(--radius-card)] border border-dashed border-line p-5 text-sm text-moss">
              {t("ابعت الفورم وهنرد عليك على الموبايل.", "Send the form and we'll get back to you by phone.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
