import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/genaan.db";
if (url.startsWith("file:")) mkdirSync("data", { recursive: true });

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined });
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
console.log(`Migrations applied to ${url.startsWith("file:") ? url : new URL(url).host}`);
client.close();
