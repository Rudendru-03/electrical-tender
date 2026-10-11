import { LEAD_ROLES, getUser, hasRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readStoredFile } from "@/lib/storage";

/** Downloads a file attached to a lead. Only signed-in staff who handle leads may fetch it. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !hasRole(user, LEAD_ROLES)) return new Response("Not found", { status: 404 });

  const { id } = await params;
  const record = await prisma.leadFile.findUnique({ where: { id } });
  const data = record ? await readStoredFile(record.key) : null;
  if (!record || !data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
