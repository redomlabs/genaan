import type { Metadata } from "next";
import { getLang, getT } from "../../lib/i18n-server";
import { pick } from "../../lib/format";
import { TrackForm } from "../../components/store/Forms";
import { MyOrdersList } from "../../components/store/MyOrders";

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), "طلباتي", "My orders"), robots: { index: false } };
}

export default async function MyOrdersPage() {
  const { t } = await getT();
  return (
    <div className="container-page grid items-start gap-10 py-10 md:py-14 lg:grid-cols-[1.5fr_1fr]">
      <section aria-labelledby="my-orders">
        <h1 id="my-orders" className="font-display text-3xl leading-tight md:text-4xl">{t("طلباتي", "My orders")}</h1>
        <p className="mt-3 mb-6 max-w-xl text-sm leading-7 text-moss">
          {t(
            "الطلبات اللي عملتها من الجهاز ده وحالة كل واحد. اضغط على الطلب علشان تشوف تفاصيله.",
            "Orders placed from this device and where each one stands. Open an order to see its details.",
          )}
        </p>
        <MyOrdersList />
      </section>
      <section aria-labelledby="find-order" className="rounded-[var(--radius-panel)] bg-white p-6">
        <h2 id="find-order" className="text-lg font-bold">{t("طلبت من جهاز تاني؟", "Ordered on another device?")}</h2>
        <p className="mt-1 mb-5 text-sm leading-6 text-moss">
          {t("اكتب رقم الطلب والموبايل اللي طلبت بيه، وهيتضاف لطلباتك هنا.", "Enter the order number and the mobile you ordered with, and it will be added here.")}
        </p>
        <TrackForm />
      </section>
    </div>
  );
}
