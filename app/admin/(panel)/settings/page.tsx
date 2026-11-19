import { getSettings } from "../../../lib/data";
import { getT } from "../../../lib/i18n-server";
import { PageHeader, Panel } from "../../ui/bits";
import { PasswordForm, SettingsForm } from "../../ui/SettingsForms";

export default async function SettingsPage() {
  const [{ t }, s] = await Promise.all([getT(), getSettings()]);
  return (
    <>
      <PageHeader title={t("الإعدادات", "Settings")} />
      <div className="space-y-6">
        <Panel>
          <h2 className="text-lg font-bold">{t("بيانات التواصل", "Contact details")}</h2>
          <p className="mb-5 mt-1 text-sm text-moss">{t("بتظهر في الفوتر وصفحة التواصل وزرار الواتساب بعد الطلب.", "Shown in the footer, on the contact page and on the WhatsApp button after ordering.")}</p>
          <SettingsForm
            group="contact"
            submitLabel={t("احفظ البيانات", "Save details")}
            fields={[
              { name: "phone", label: t("رقم التليفون", "Phone"), dir: "ltr", value: s.phone, type: "tel" },
              { name: "whatsapp", label: t("رقم الواتساب", "WhatsApp number"), dir: "ltr", value: s.whatsapp, type: "tel", hint: t("مثل 01012345678", "e.g. 01012345678") },
              { name: "email", label: t("الإيميل", "Email"), dir: "ltr", value: s.email, type: "email" },
              { name: "instagram", label: t("رابط إنستجرام", "Instagram link"), dir: "ltr", value: s.instagram, type: "url" },
              { name: "facebook", label: t("رابط فيسبوك", "Facebook link"), dir: "ltr", value: s.facebook, type: "url" },
              { name: "address_ar", label: t("العنوان بالعربي", "Address in Arabic"), dir: "rtl", value: s.addressAr, wide: true },
              { name: "address_en", label: t("العنوان بالإنجليزي", "Address in English"), dir: "ltr", value: s.addressEn, wide: true },
            ]}
          />
        </Panel>
        <Panel>
          <h2 className="mb-5 text-lg font-bold">{t("كلمة السر", "Password")}</h2>
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
