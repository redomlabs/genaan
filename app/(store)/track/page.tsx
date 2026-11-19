import type { Metadata } from "next";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";
import { TrackForm } from "../../components/store/Forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "تتبع طلبك", "Track an order") };
}

export default async function TrackPage() {
  const { t } = await getT();
  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2 md:py-20">
      <div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">{t("فين طلبي؟", "Where's my order?")}</h1>
        <p className="mt-4 max-w-md text-base leading-8 text-moss">
          {t(
            "اكتب رقم الطلب اللي ظهر لك بعد ما طلبت، والموبايل اللي سجلته، وهتشوف حالة الطلب وتفاصيله.",
            "Enter the order number you saw after ordering and the mobile number you used to see its status and details.",
          )}
        </p>
      </div>
      <div className="rounded-[var(--radius-panel)] bg-white p-6 md:p-8">
        <TrackForm />
      </div>
    </div>
  );
}
