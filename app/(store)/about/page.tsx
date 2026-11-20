import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "عن جنان", "About Genaan") };
}

export default async function AboutPage() {
  const { t } = await getT();
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display max-w-3xl text-3xl leading-tight md:text-5xl">
        {t("جنان يعني جناين. وده اللي بنعمله.", "Genaan means gardens. That's what we make.")}
      </h1>
      <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
        <Image
          src="/assets/hero_image.png"
          alt={t("نباتات ونخيل داخلي في مساحة عمل", "Indoor plants and palms in a workspace")}
          width={1425}
          height={690}
          className="h-80 w-full rounded-[var(--radius-panel)] object-cover md:h-[28rem]"
        />
        <div className="space-y-5 text-base leading-8 text-moss">
          <p>
            {t(
              "بنشتغل في اتجاهين: نجهز أماكن الشغل بنباتات ونخيل داخلي بتعيش في التكييف والإضاءة الضعيفة، ونزرع الحدائق والأراضي بشجر مثمر وشجر زينة مناسب للمناخ المصري.",
              "We work in two directions: furnishing workplaces with indoor plants and palms that cope with air-conditioning and low light, and planting gardens and land with fruit and ornamental trees suited to Egypt's climate.",
            )}
          </p>
          <p>
            {t(
              "علشان الطلب يبقى سهل، كل حاجة عندنا بسعر واضح: الباقة بسعر ثابت، الشجرة بسعرها، والتوصيل والزراعة بيتحسبوا قدامك قبل ما تأكد.",
              "To keep ordering simple, everything has a clear price: bundles cost a fixed amount, each tree has its own price, and delivery and planting are worked out in front of you before you confirm.",
            )}
          </p>
          <p>
            {t(
              "قبل التنفيذ بنكلمك نراجع المكان أو الأرض، ولو صنف مش متاح بنقترح بديل بنفس الحجم والسعر.",
              "Before we deliver we call to check the space or land, and if a variety is out of stock we suggest an equivalent of the same size and price.",
            )}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/business" className="btn btn-primary">{t("باقات الأماكن", "Workplace bundles")}</Link>
            <Link href="/planting" className="btn btn-harvest">{t("الشجر والزراعة", "Trees and planting")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
