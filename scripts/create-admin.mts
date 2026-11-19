import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../app/lib/db/schema";
import { upsertAdminFromEnv } from "./admin-lib";

// Creates an admin, or resets an existing admin's password, from
// ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME.
const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/genaan.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
await upsertAdminFromEnv(drizzle(client, { schema }), { resetPassword: true });
client.close();
