import { mimeOf, readStoredFile } from "@/lib/storage";

/** Serves public CMS uploads (project photos, logos, credential documents) stored under "media/". */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some((segment) => segment === ".." || segment.includes("\\"))) {
    return new Response("Not found", { status: 404 });
  }
  const key = `media/${path.join("/")}`;
  const file = await readStoredFile(key);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": mimeOf(key),
      "Content-Length": String(file.length),
      // Keys are random UUIDs and never reused, so they can be cached for a long time.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
