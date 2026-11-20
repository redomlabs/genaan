import type { Metadata } from "next";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "سياسة الخصوصية", "Privacy policy") };
}

export default async function PrivacyPage() {
  const { t } = await getT();
  const sections: [string, string][] = [
    [
      t("البيانات اللي بنجمعها", "What we collect"),
      t(
        "لما تطلب أو تبعت رسالة بنحفظ الاسم والموبايل والعنوان والمنطقة والإيميل لو كتبته، وتفاصيل الطلب.",
        "When you order or send a message we keep your name, mobile number, address, area, email if given, and the order details.",
      ),
    ],
    [
      t("بنستخدمها في إيه", "How we use it"),
      t(
        "علشان نأكد الطلب ونوصّله ونزرعه ونتواصل معاك بخصوصه. مش بنبيع بياناتك ولا بنشاركها غير مع اللي بيوصّل طلبك.",
        "To confirm, deliver and plant your order and to contact you about it. We don't sell your data or share it beyond the people delivering your order.",
      ),
    ],
    [
      t("الكوكيز", "Cookies"),
      t(
        "بنستخدم كوكي واحدة لحفظ اللغة، والسلة محفوظة على جهازك بس.",
        "We use one cookie to remember your language. Your cart is stored only on your device.",
      ),
    ],
    [
      t("حذف البيانات", "Deleting your data"),
      t("تقدر تطلب حذف بياناتك من صفحة التواصل.", "You can ask us to delete your data from the contact page."),
    ],
  ];
  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">{t("سياسة الخصوصية", "Privacy policy")}</h1>
      <div className="mt-8 space-y-8">
        {sections.map(([h, p]) => (
          <section key={h}>
            <h2 className="text-xl font-bold">{h}</h2>
            <p className="mt-2 text-base leading-8 text-moss">{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
