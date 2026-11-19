import { createClient } from "@libsql/client";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../app/lib/db/schema";
import { SEED_BUNDLES, SEED_ITEMS, SEED_SETTINGS, SEED_ZONES } from "./seed-data";
import { upsertAdminFromEnv } from "./admin-lib";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/genaan.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
const db = drizzle(client, { schema });

const [{ items }] = await db.select({ items: count() }).from(schema.catalogItems);
if (items === 0) {
  await db.insert(schema.catalogItems).values(
    SEED_ITEMS.map((item, index) => ({ ...item, sortOrder: index + 1 })),
  );
  console.log(`Added ${SEED_ITEMS.length} plants and trees`);
}

const [{ bundles }] = await db.select({ bundles: count() }).from(schema.bundles);
if (bundles === 0) {
  const catalog = await db.select({ id: schema.catalogItems.id, slug: schema.catalogItems.slug }).from(schema.catalogItems);
  const idBySlug = new Map(catalog.map((c) => [c.slug, c.id]));
  for (const [index, { items: contents, ...bundle }] of SEED_BUNDLES.entries()) {
    const [row] = await db
      .insert(schema.bundles)
      .values({ ...bundle, sortOrder: index + 1 })
      .returning({ id: schema.bundles.id });
    const lines = Object.entries(contents).map(([slug, quantity]) => {
      const itemId = idBySlug.get(slug);
      if (!itemId) throw new Error(`Bundle ${bundle.slug} uses unknown item ${slug}`);
      return { bundleId: row.id, itemId, quantity };
    });
    await db.insert(schema.bundleItems).values(lines);
  }
  console.log(`Added ${SEED_BUNDLES.length} bundles`);
}

const [{ zones }] = await db.select({ zones: count() }).from(schema.deliveryZones);
if (zones === 0) {
  await db.insert(schema.deliveryZones).values(SEED_ZONES.map((z, i) => ({ ...z, sortOrder: i + 1 })));
  console.log(`Added ${SEED_ZONES.length} delivery zones`);
}

for (const [key, value] of Object.entries(SEED_SETTINGS)) {
  const existing = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  if (existing.length === 0) await db.insert(schema.settings).values({ key, value });
}

await upsertAdminFromEnv(db, { resetPassword: false });
client.close();
