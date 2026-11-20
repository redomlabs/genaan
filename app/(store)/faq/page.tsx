import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "../../lib/data";
import { getLang, getT } from "../../lib/i18n-server";
import { formatMoney, pick } from "../../lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "أسئلة متكررة", "Questions") };
}

export default async function FaqPage() {
  const [{ t, lang }, settings] = await Promise.all([getT(), getSettings()]);
  const questions: [string, string][] = [
    [
      t("إزاي أعرف الباقة المناسبة لمكاني؟", "How do I know which bundle fits my space?"),
      t(
        "كل باقة مكتوب جنبها المساحة المناسبة لها بالمتر. استخدم المسطرة في صفحة الباقات، أو اكتب المساحة، وهتظهر لك الباقة الأقرب.",
        "Every bundle lists the floor area it suits. Use the ruler on the bundles page or type your area to see the closest bundle.",
      ),
    ],
    [
      t("التوصيل بكام؟", "How much is delivery?"),
      t(
        "رسوم التوصيل ثابتة للطلب كله حسب منطقتك، وبتظهر لك في صفحة إتمام الطلب قبل ما تأكد.",
        "Delivery is one fee for the whole order based on your area, shown at checkout before you confirm.",
      ),
    ],
    [
      t("الزراعة بتتحسب إزاي؟", "How is planting priced?"),
      t(
        `بالشجرة: ${formatMoney(settings.plantingFeePerTree, lang)} لأغلب الأنواع، وبعض الأنواع الكبيرة زي النخيل ليها سعر مختلف مكتوب تحتها.${settings.plantingVisitFee > 0 ? ` وفيه رسوم زيارة ${formatMoney(settings.plantingVisitFee, lang)} للطلب.` : ""} الزراعة اختيارية، وتقدر تشيلها من السلة.`,
        `Per tree: ${formatMoney(settings.plantingFeePerTree, lang)} for most kinds, and larger trees such as palms show their own fee.${settings.plantingVisitFee > 0 ? ` There is also a ${formatMoney(settings.plantingVisitFee, lang)} visit fee per order.` : ""} Planting is optional and you can turn it off in your cart.`,
      ),
    ],
    [
      t("هدفع إمتى؟", "When do I pay?"),
      t(
        "مفيش دفع أونلاين. تدفع كاش عند الاستلام، أو تحويل إنستاباي أو فودافون كاش بعد ما نكلمك ونأكد الطلب.",
        "There's no online payment. Pay cash on delivery, or by InstaPay or Vodafone Cash after we call to confirm the order.",
      ),
    ],
    [
      t("لو صنف مش متاح؟", "What if a variety is out of stock?"),
      t(
        "بنقترح بديل بنفس الحجم والسعر وناخد موافقتك قبل التوصيل.",
        "We suggest an equivalent of the same size and price and ask you before delivery.",
      ),
    ],
    [
      t("عندي أرض أكبر من فدان أو أكتر من فرع؟", "I have more than a feddan or several branches."),
      t("ابعت لنا التفاصيل من صفحة التواصل ونعمل معاينة وعرض سعر.", "Send us the details from the contact page and we'll arrange a visit and a quote."),
    ],
  ];
  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">{t("أسئلة متكررة", "Questions")}</h1>
      <div className="mt-8 divide-y divide-line rounded-[var(--radius-panel)] bg-white px-6">
        {questions.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex list-none items-center justify-between gap-4 text-base font-bold [&::-webkit-details-marker]:hidden">
              {q}
              <span className="text-xl text-leaf transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-sm leading-7 text-moss">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-moss">
        {t("سؤالك مش هنا؟ ", "Question not here? ")}
        <Link href="/contact" className="font-semibold text-canopy underline">{t("ابعت لنا", "Ask us")}</Link>
      </p>
    </div>
  );
}
