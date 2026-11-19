import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "../../lib/auth";
import { getDb, schema } from "../../lib/db";
import { AdminNav } from "../ui/AdminNav";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const db = getDb();
  const [[orders], [enquiries]] = await Promise.all([
    db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "new")),
    db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, "new")),
  ]);
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <AdminNav name={admin.name} badges={{ orders: orders.n, enquiries: enquiries.n }} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
