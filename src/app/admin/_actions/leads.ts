"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { ADMIN_ONLY, LEAD_ROLES, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/admin/resources";
import { prisma } from "@/lib/db";
import { CLIENT_TYPES, LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES, generateReference } from "@/lib/leads";
import { deleteStoredFile } from "@/lib/storage";

function valuesOf(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;
  return values;
}

const updateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  source: z.enum(LEAD_SOURCES),
  assignedToId: z.string(),
});

export async function updateLead(id: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser(LEAD_ROLES);
  const parsed = updateSchema.safeParse(valuesOf(formData));
  if (!parsed.success) return { error: "Invalid values." };
  const { status, source, assignedToId } = parsed.data;

  if (assignedToId) {
    const assignee = await prisma.adminUser.findFirst({ where: { id: assignedToId, active: true }, select: { id: true } });
    if (!assignee) return { error: "That user is not available." };
  }
  await prisma.lead.update({ where: { id }, data: { status, source, assignedToId: assignedToId || null } });
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function addLeadNote(id: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(LEAD_ROLES);
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 4000) return { error: "Note is too long.", values: { body } };
  await prisma.leadNote.create({ data: { leadId: id, authorId: user.id, body } });
  revalidatePath(`/admin/leads/${id}`);
  return { ok: "Note added." };
}

// Leads typed in by staff (from a call, WhatsApp chat, etc.) need less than the public forms ask for.
const manualSchema = z.object({
  type: z.enum(LEAD_TYPES),
  source: z.enum(LEAD_SOURCES),
  clientType: z.union([z.literal(""), z.enum(CLIENT_TYPES)]),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  email: z.union([z.literal(""), z.email().max(160)]),
  organisation: z.string().trim().max(160),
  city: z.string().trim().max(80),
  workType: z.string().trim().max(160),
  estimatedValue: z.string().trim().max(60),
  deadline: z.string().trim(),
  message: z.string().trim().max(4000),
});

export async function createLead(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(LEAD_ROLES);
  const values = valuesOf(formData);
  const parsed = manualSchema.safeParse(values);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= "Check this value";
    return { error: "Please fix the highlighted fields.", fields, values };
  }
  const data = parsed.data;
  const deadline = data.deadline ? new Date(data.deadline) : null;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return { error: "Please fix the highlighted fields.", fields: { deadline: "Invalid date" }, values };
  }

  const lead = await prisma.lead.create({
    data: {
      reference: generateReference(siteConfig.leads.refPrefix),
      type: data.type,
      source: data.source,
      clientType: data.clientType || null,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      organisation: data.organisation || null,
      city: data.city || null,
      workType: data.workType || null,
      estimatedValue: data.estimatedValue || null,
      deadline,
      message: data.message || null,
      assignedToId: user.id,
    },
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/leads/${lead.id}`);
}

export async function deleteLead(id: string): Promise<void> {
  await requireUser(ADMIN_ONLY);
  const files = await prisma.leadFile.findMany({ where: { leadId: id }, select: { key: true } });
  await prisma.lead.delete({ where: { id } });
  await Promise.all(files.map((file) => deleteStoredFile(file.key)));
  revalidatePath("/admin", "layout");
  redirect("/admin/leads");
}
