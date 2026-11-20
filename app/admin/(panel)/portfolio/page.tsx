import { getPortfolio } from "../../../lib/data";
import { getT } from "../../../lib/i18n-server";
import { PageHeader } from "../../ui/bits";
import { PortfolioManager, PortfolioSwitch } from "../../ui/PortfolioAdmin";

export default async function PortfolioPage() {
  const [{ t }, { enabled, projects }] = await Promise.all([getT(), getPortfolio(true)]);
  return (
    <>
      <PageHeader
        title={t("أعمالنا السابقة", "Our work")}
        intro={t("صور شغل عملته لعملائك. القسم بيظهر في الصفحة الرئيسية بس لما تفعّله.", "Photos of work you've done for clients. The section appears on the home page only when you turn it on.")}
      />
      <div className="space-y-6">
        <PortfolioSwitch enabled={enabled} count={projects.filter((p) => p.isActive).length} />
        <PortfolioManager projects={projects} />
      </div>
    </>
  );
}
