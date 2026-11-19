import { defineConfig } from "drizzle-kit";

// Used to generate SQL migrations from app/lib/db/schema.ts (npm run db:generate).
// Migrations are applied with scripts/migrate.mts (npm run db:migrate).
export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./data/genaan.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
