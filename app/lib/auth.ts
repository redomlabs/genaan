import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";

export { hashPassword, verifyPassword } from "./password";

export const SESSION_COOKIE = "genaan_admin";
const SESSION_DAYS = 7;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

type SessionPayload = { id: number; v: number; exp: number };

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function startSession(admin: { id: number; sessionVersion: number }) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encode({ id: admin.id, v: admin.sessionVersion, exp: expires }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type AdminUser = { id: number; email: string; name: string };

/** The signed-in admin, checked against the database on every request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const payload = decode((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const [admin] = await getDb()
    .select({
      id: schema.admins.id,
      email: schema.admins.email,
      name: schema.admins.name,
      sessionVersion: schema.admins.sessionVersion,
    })
    .from(schema.admins)
    .where(eq(schema.admins.id, payload.id))
    .limit(1);
  if (!admin || admin.sessionVersion !== payload.v) return null;
  return { id: admin.id, email: admin.email, name: admin.name };
});

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
