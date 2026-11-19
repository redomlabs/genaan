import { getSettings, getZones } from "../../../lib/data";
import { getT } from "../../../lib/i18n-server";
import { PageHeader, Panel } from "../../ui/bits";
import { SettingsForm, ZoneRow } from "../../ui/SettingsForms";

export default async function FeesPage() {
  const [{ t }, zones, settings] = await Promise.all([getT(), getZones(true), getSettings()]);
  return (
    <>
      <PageHeader
        title={t("التوصيل والزراعة", "Delivery and planting")}
        intro={t(
          "الرسوم دي بتتحسب للعميل أوتوماتيك في صفحة الطلب. أي تعديل بيطبق على الطلبات الجديدة بس.",
          "These fees are added for customers automatically at checkout. Changes apply to new orders only.",
        )}
      />
      <div className="space-y-6">
        <Panel>
          <h2 className="text-lg font-bold">{t("رسوم الزراعة", "Planting fees")}</h2>
          <p className="mb-5 mt-1 text-sm text-moss">
            {t(
              "بتتطبق لما العميل يختار «ازرعها لي» للشجر أو باقات الزراعة. تقدر تحدد رسوم مختلفة لنوع معين من صفحة النباتات والشجر.",
              "Applied when a customer ticks “Plant it for me” on trees or planting bundles. Set a different fee for a specific tree on the plants and trees page.",
            )}
          </p>
          <SettingsForm
            group="fees"
            submitLabel={t("احفظ الرسوم", "Save fees")}
            fields={[
              { name: "planting_fee_per_tree", type: "number", label: t("زراعة الشجرة الواحدة (ج.م)", "Planting per tree (EGP)"), value: String(settings.plantingFeePerTree) },
              {
                name: "planting_visit_fee",
                type: "number",
                label: t("زيارة الزراعة لكل طلب (ج.م)", "Planting visit per order (EGP)"),
                hint: t("رسوم ثابتة مرة واحدة لو الطلب فيه زراعة. صفر = بدون.", "Charged once when an order includes planting. 0 turns it off."),
                value: String(settings.plantingVisitFee),
              },
              {
                name: "free_delivery_threshold",
                type: "number",
                label: t("توصيل مجاني للطلبات من (ج.م)", "Free delivery on orders from (EGP)"),
                hint: t("صفر = مفيش توصيل مجاني.", "0 means no free delivery."),
                value: String(settings.freeDeliveryThreshold),
              },
            ]}
          />
        </Panel>

        <Panel>
          <h2 className="text-lg font-bold">{t("مناطق التوصيل", "Delivery areas")}</h2>
          <p className="mt-1 text-sm text-moss">
            {t(
              "العميل بيختار منطقته في صفحة الطلب ورسومها بتتضاف مرة واحدة للطلب كله. المناطق المقفولة مش بتظهر للعملاء.",
              "Customers choose their area at checkout and its fee is added once per order. Areas switched off are hidden from customers.",
            )}
          </p>
          <div className="mt-2">
            {zones.map((z) => (
              <ZoneRow key={z.id} zone={z} />
            ))}
            <div className="pt-4">
              <h3 className="text-sm font-bold">{t("منطقة جديدة", "New area")}</h3>
              <ZoneRow zone={null} />
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
