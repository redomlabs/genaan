import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { genaanClient?: Client; genaanDb?: Database };

export function connectionConfig() {
  const url = process.env.DATABASE_URL || "file:./data/genaan.db";
  return { url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined };
}

/** One shared connection per server instance (and across dev hot reloads). */
export function getDb(): Database {
  if (!globalForDb.genaanDb) {
    globalForDb.genaanClient = createClient(connectionConfig());
    globalForDb.genaanDb = drizzle(globalForDb.genaanClient, { schema });
  }
  return globalForDb.genaanDb;
}

export { schema };
