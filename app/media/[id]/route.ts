import { eq } from "drizzle-orm";
import { getDb, schema } from "../../lib/db";

/** Serves images uploaded from the dashboard. Each id is immutable, so caches can keep it forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const [file] = await getDb()
    .select({ mime: schema.media.mime, data: schema.media.data })
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
