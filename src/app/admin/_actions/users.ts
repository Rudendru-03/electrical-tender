"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ADMIN_ONLY, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/admin/resources";
import { prisma } from "@/lib/db";

const ROLES = ["ADMIN", "SALES", "CONTENT"] as const;
const MIN_PASSWORD = 10;

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(160),
  role: z.enum(ROLES),
  password: z.string().min(MIN_PASSWORD).max(200),
});

export async function createUser(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser(ADMIN_ONLY);
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
  };
  const parsed = createSchema.safeParse({ ...values, password: String(formData.get("password") ?? "") });
  if (!parsed.success) {
    return { error: `Enter a name, a valid email, a role and a password of at least ${MIN_PASSWORD} characters.`, values };
  }
  const { password, ...data } = parsed.data;
  try {
    await prisma.adminUser.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12) } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return { error: "A user with this email already exists.", values };
    throw error;
  }
  revalidatePath("/admin/users");
  return { ok: `User ${data.email} created.` };
}

const updateSchema = z.object({
  role: z.enum(ROLES),
  active: z.boolean(),
  password: z.union([z.literal(""), z.string().min(MIN_PASSWORD).max(200)]),
});

export async function updateUser(id: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const current = await requireUser(ADMIN_ONLY);
  const parsed = updateSchema.safeParse({
    role: String(formData.get("role") ?? ""),
    active: formData.get("active") === "on",
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: `New password must be at least ${MIN_PASSWORD} characters.` };
  const { role, active, password } = parsed.data;

  // An admin cannot lock themselves out.
  if (id === current.id && (!active || role !== "ADMIN")) {
    return { error: "You cannot deactivate or demote your own account." };
  }
  await prisma.adminUser.update({
    where: { id },
    data: { role, active, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
  });
  revalidatePath("/admin/users");
  return { ok: "Saved." };
}
