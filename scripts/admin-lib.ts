import { eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../app/lib/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../app/lib/password";

/**
 * Creates the admin named in ADMIN_EMAIL / ADMIN_PASSWORD (and ADMIN_NAME).
 * With resetPassword, an existing admin's password is replaced and their sessions end.
 */
export async function upsertAdminFromEnv(
  db: LibSQLDatabase<typeof schema>,
  { resetPassword }: { resetPassword: boolean },
) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Genaan admin";
  if (!email || !password) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD are not set, so no admin was created.");
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const [existing] = await db.select().from(schema.admins).where(eq(schema.admins.email, email));
  if (!existing) {
    await db.insert(schema.admins).values({ email, name, passwordHash: await hashPassword(password) });
    console.log(`Created admin ${email}`);
  } else if (resetPassword) {
    await db
      .update(schema.admins)
      .set({ passwordHash: await hashPassword(password), sessionVersion: sql`${schema.admins.sessionVersion} + 1` })
      .where(eq(schema.admins.id, existing.id));
    console.log(`Reset the password for ${email}`);
  } else {
    console.log(`Admin ${email} already exists`);
  }
}
