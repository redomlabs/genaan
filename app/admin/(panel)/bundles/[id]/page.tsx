import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundleById, getCatalog, getSettings } from "../../../../lib/data";
import { getT } from "../../../../lib/i18n-server";
import type { Service } from "../../../../lib/types";
import { PageHeader } from "../../../ui/bits";
import { BundleForm } from "../../../ui/BundleForm";

export default async function EditBundlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ id }, { service: serviceParam }, { t }] = await Promise.all([params, searchParams, getT()]);
  const isNew = id === "new";
  const bundle = isNew ? null : await getBundleById(Number(id));
  if (!isNew && !bundle) notFound();
  const service: Service = bundle?.service ?? (serviceParam === "planting" ? "planting" : "business");
  const [catalog, settings] = await Promise.all([getCatalog(true), getSettings()]);

  return (
    <>
      <p className="mb-3 text-sm">
        <Link href="/admin/bundles" className="text-moss hover:text-forest hover:underline">{t("الباقات", "Bundles")}</Link>
      </p>
      <PageHeader
        title={
          isNew
            ? service === "planting"
              ? t("باقة زراعة جديدة", "New planting bundle")
              : t("باقة أماكن جديدة", "New workplace bundle")
            : t("تعديل الباقة", "Edit bundle")
        }
      />
      <BundleForm bundle={bundle} service={service} catalog={catalog} plantingFeePerTree={settings.plantingFeePerTree} />
    </>
  );
}
