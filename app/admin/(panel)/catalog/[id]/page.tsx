import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../../../../lib/db";
import { getSettings } from "../../../../lib/data";
import { getT } from "../../../../lib/i18n-server";
import type { ItemKind } from "../../../../lib/types";
import { PageHeader } from "../../../ui/bits";
import { ItemForm } from "../../../ui/ItemForm";

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const [{ id }, { kind }, { t }, settings] = await Promise.all([params, searchParams, getT(), getSettings()]);
  const isNew = id === "new";
  const [item] = isNew ? [null] : await getDb().select().from(schema.catalogItems).where(eq(schema.catalogItems.id, Number(id))).limit(1);
  if (!isNew && !item) notFound();
  const defaultKind = (["indoor", "palm", "fruit", "ornamental"] as ItemKind[]).find((k) => k === kind) ?? "fruit";

  return (
    <>
      <p className="mb-3 text-sm">
        <Link href={`/admin/catalog?kind=${item?.kind ?? defaultKind}`} className="text-moss hover:text-forest hover:underline">{t("النباتات والشجر", "Plants and trees")}</Link>
      </p>
      <PageHeader title={isNew ? t("نوع جديد", "New variety") : t("تعديل النوع", "Edit variety")} />
      <ItemForm item={item ?? null} defaultKind={defaultKind} plantingFeePerTree={settings.plantingFeePerTree} />
    </>
  );
}
