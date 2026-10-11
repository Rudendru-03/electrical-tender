import { after } from "next/server";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/db";
import { verifyCaptcha } from "@/lib/captcha";
import { TYPES_WITH_FILES, generateReference, leadSchema } from "@/lib/leads";
import { notifyNewLead } from "@/lib/lead-notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { deleteStoredFile, extensionOf, saveFile } from "@/lib/storage";

function fail(status: number, error: string, fields?: Record<string, string>) {
  return Response.json({ error, fields }, { status });
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const { rateLimitMax, rateLimitWindowMin, refPrefix } = siteConfig.leads;
  const limit = rateLimit(`lead:${ip}`, rateLimitMax, rateLimitWindowMin * 60_000);
  if (!limit.allowed) {
    return Response.json({ error: "rateLimit" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  // Refuse oversized bodies before buffering them.
  const { maxFiles, maxSizeMb, maxTotalMb, allowedExt } = siteConfig.uploads;
  const maxBytes = (maxTotalMb + 1) * 1024 * 1024;
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return fail(413, "fileSize");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "generic");
  }

  // Honeypot: pretend success so bots do not learn they were dropped.
  if (String(form.get("website") ?? "") !== "") {
    return Response.json({ reference: generateReference(refPrefix), emailed: false });
  }

  if (siteConfig.captcha.enabled) {
    const ok = await verifyCaptcha(String(form.get("captchaToken") ?? ""), ip);
    if (!ok) return fail(400, "captcha");
  }

  const raw: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") raw[key] = value;
  }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const name = String(issue.path[0] ?? "");
      const known = ["required", "email", "phone"].includes(issue.message) ? issue.message : "invalid";
      if (name && !fields[name]) fields[name] = known;
    }
    return fail(400, "validation", fields);
  }
  const lead = parsed.data;

  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 0 && !TYPES_WITH_FILES.includes(lead.type)) return fail(400, "fileType");
  if (files.length > maxFiles) return fail(400, "fileCount");
  if (files.some((file) => file.size > maxSizeMb * 1024 * 1024)) return fail(400, "fileSize");
  if (files.reduce((sum, file) => sum + file.size, 0) > maxTotalMb * 1024 * 1024) return fail(400, "fileTotal");
  if (files.some((file) => !allowedExt.includes(extensionOf(file.name)))) return fail(400, "fileType");

  const savedKeys: string[] = [];
  try {
    const reference = generateReference(refPrefix);
    const stored = [];
    for (const file of files) {
      const saved = await saveFile(`leads/${reference}`, file);
      savedKeys.push(saved.key);
      stored.push(saved);
    }

    const created = await prisma.lead.create({
      data: {
        reference,
        type: lead.type,
        source: "WEBSITE",
        clientType: lead.clientType,
        name: lead.name,
        organisation: lead.organisation,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        state: lead.state,
        workType: lead.workType,
        estimatedValue: lead.estimatedValue,
        deadline: lead.deadline,
        preferredAt: lead.preferredAt,
        position: lead.position,
        message: lead.message,
        locale: lead.locale ?? "en",
        pagePath: lead.pagePath,
        files: { create: stored },
      },
      include: { files: true },
    });

    // Email after the response is sent so a slow SMTP server does not hold up the visitor.
    after(() => notifyNewLead(created));

    return Response.json({ reference, emailed: Boolean(created.email) && siteConfig.mail.host !== "" });
  } catch (error) {
    console.error("[leads] failed to save lead", error);
    await Promise.all(savedKeys.map(deleteStoredFile));
    return fail(500, "generic");
  }
}
