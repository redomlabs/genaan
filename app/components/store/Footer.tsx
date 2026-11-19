import Link from "next/link";
import { getSettings } from "../../lib/data";
import { getT } from "../../lib/i18n-server";
import { normalizePhone, whatsappLink } from "../../lib/format";
import { Logo } from "../Logo";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../icons";

export async function Footer() {
  const [{ t, lang }, settings] = await Promise.all([getT(), getSettings()]);
  const wa = whatsappLink(settings.whatsapp);
  const phone = normalizePhone(settings.phone);
  const address = lang === "ar" ? settings.addressAr : settings.addressEn;
  const social = [
    settings.instagram && { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    settings.facebook && { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    wa && { href: wa, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <footer className="mt-auto bg-forest text-mint">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-7">
            {t(
              "باقات نباتات لمكان شغلك، وشجر مثمر وزينة نزرعه في حديقتك أو أرضك.",
              "Plant bundles for your workplace, and fruit and ornamental trees planted in your garden or land.",
            )}
          </p>
          {social.length > 0 && (
            <div className="mt-5 flex gap-2">
              {social.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          )}
        </div>
        <nav aria-label={t("الخدمات", "Services")}>
          <h2 className="mb-4 text-sm font-bold text-white">{t("الخدمات", "Services")}</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/business" className="hover:text-white">{t("باقات الشركات والعيادات", "Bundles for businesses")}</Link></li>
            <li><Link href="/planting" className="hover:text-white">{t("زراعة الحدائق والأراضي", "Garden and land planting")}</Link></li>
            <li><Link href="/planting#trees" className="hover:text-white">{t("أسعار الشجر", "Tree prices")}</Link></li>
            <li><Link href="/contact?topic=planting" className="hover:text-white">{t("مشروع زراعة كبير", "Large planting projects")}</Link></li>
          </ul>
        </nav>
        <nav aria-label={t("المساعدة", "Help")}>
          <h2 className="mb-4 text-sm font-bold text-white">{t("المساعدة", "Help")}</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/track" className="hover:text-white">{t("تتبع طلبك", "Track an order")}</Link></li>
            <li><Link href="/faq" className="hover:text-white">{t("أسئلة متكررة", "Questions")}</Link></li>
            <li><Link href="/about" className="hover:text-white">{t("عن جنان", "About Genaan")}</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">{t("الخصوصية", "Privacy")}</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 text-sm font-bold text-white">{t("كلمنا", "Get in touch")}</h2>
          <ul className="space-y-3 text-sm">
            {phone && (
              <li>
                <a href={`tel:+${phone}`} className="inline-flex items-center gap-2 hover:text-white">
                  <PhoneIcon size={17} /> <span dir="ltr" className="num">+{phone}</span>
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon size={17} /> {t("واتساب", "WhatsApp")}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 break-all hover:text-white">
                  <MailIcon size={17} /> {settings.email}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <PinIcon size={17} className="mt-0.5 shrink-0" /> {address}
              </li>
            )}
            <li>
              <Link href="/contact" className="font-semibold text-white underline-offset-4 hover:underline">
                {t("ابعت لنا رسالة", "Send us a message")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-sage">
          © {new Date().getFullYear()} {t("جنان", "Genaan")}
        </p>
      </div>
    </footer>
  );
}
