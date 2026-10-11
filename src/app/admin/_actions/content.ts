"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { CONTENT_ROLES, requireUser } from "@/lib/auth";
import { delegateFor, fileKeysOf, getRecord } from "@/lib/admin/records";
import { type ActionState, type Field, getResource, slugify } from "@/lib/admin/resources";
import { IMAGE_EXT, deleteStoredFile, extensionOf, saveFile } from "@/lib/storage";

const FIX = "Please fix the highlighted fields.";

function uploadsOf(formData: FormData, name: string): File[] {
  return formData.getAll(name).filter((item): item is File => item instanceof File && item.size > 0);
}

function checkUpload(file: File, field: Field): string | undefined {
  const { maxSizeMb, allowedExt } = siteConfig.uploads;
  const allowed = field.type === "file" ? allowedExt : IMAGE_EXT;
  if (!allowed.includes(extensionOf(file.name))) return `Allowed file types: ${allowed.join(", ")}`;
  if (file.size > maxSizeMb * 1024 * 1024) return `File is larger than ${maxSizeMb} MB`;
  return undefined;
}

/** Creates (id = null) or updates a CMS record from the generic admin form. */
export async function saveRecord(
  resourceKey: string,
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser(CONTENT_ROLES);
  const resource = getResource(resourceKey);
  if (!resource) return { error: "Unknown content type." };
  const existing = id ? await getRecord(resource, id) : null;
  if (id && !existing) return { error: "This record no longer exists." };

  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;

  const data: Record<string, unknown> = {};
  const fields: Record<string, string> = {};
  const pendingUploads: { field: Field; files: File[]; kept: string[] }[] = [];
  const removedKeys: string[] = [];

  for (const field of resource.fields) {
    const raw = (values[field.name] ?? "").trim();
    switch (field.type) {
      case "text":
      case "textarea":
      case "markdown":
      case "select": {
        if (field.required && !raw) fields[field.name] = "Required";
        else if (field.type === "select" && raw && !field.options?.includes(raw)) fields[field.name] = "Choose one of the options";
        data[field.name] = raw || (field.nullable ? null : "");
        break;
      }
      case "slug": {
        const slug = slugify(raw || values[resource.titleField] || "");
        if (!slug) fields[field.name] = "Required";
        data[field.name] = slug;
        break;
      }
      case "number": {
        if (!raw) {
          data[field.name] = field.nullable ? null : 0;
        } else if (!/^-?\d+$/.test(raw)) {
          fields[field.name] = "Enter a whole number";
        } else {
          data[field.name] = Number.parseInt(raw, 10);
        }
        break;
      }
      case "boolean": {
        data[field.name] = values[field.name] === "on";
        break;
      }
      case "date": {
        const date = raw ? new Date(raw) : null;
        if (date && Number.isNaN(date.getTime())) fields[field.name] = "Invalid date";
        else if (!date && field.required) fields[field.name] = "Required";
        data[field.name] = date;
        break;
      }
      case "list": {
        data[field.name] = raw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        break;
      }
      case "image":
      case "file":
      case "images": {
        const current = existing ? fileKeysOf({ ...resource, fields: [field] }, existing) : [];
        const remove = formData.getAll(`${field.name}__remove`).map(String);
        const files = uploadsOf(formData, field.name);
        const problem = files.map((file) => checkUpload(file, field)).find(Boolean);
        if (problem) fields[field.name] = problem;
        // A new single upload replaces the current file.
        const replaced = field.type !== "images" && files.length > 0 ? current : [];
        const kept = current.filter((key) => !remove.includes(key) && !replaced.includes(key));
        removedKeys.push(...current.filter((key) => !kept.includes(key)));
        pendingUploads.push({ field, files: field.type === "images" ? files : files.slice(0, 1), kept });
        break;
      }
    }
  }

  if (Object.keys(fields).length > 0) return { error: FIX, fields, values };

  if (resource.key === "blog" && data.published === true && !data.publishedAt) data.publishedAt = new Date();

  const uploadedKeys: string[] = [];
  try {
    for (const { field, files, kept } of pendingUploads) {
      const keys = [...kept];
      for (const file of files) {
        const saved = await saveFile(`media/${resource.key}`, file);
        uploadedKeys.push(saved.key);
        keys.push(saved.key);
      }
      data[field.name] = field.type === "images" ? keys : (keys[0] ?? null);
    }

    const delegate = delegateFor(resource);
    if (existing) await delegate.update({ where: { id: existing.id }, data });
    else await delegate.create({ data });
  } catch (error) {
    await Promise.all(uploadedKeys.map(deleteStoredFile));
    if ((error as { code?: string }).code === "P2002") {
      return { error: FIX, fields: { slug: "This slug is already in use" }, values };
    }
    console.error(`[admin] failed to save ${resource.singular}`, error);
    return { error: "Could not save. Please try again.", values };
  }

  await Promise.all(removedKeys.map(deleteStoredFile));
  // Content appears across many public pages (lists, home, footer, sitemap), so refresh them all.
  revalidatePath("/", "layout");
  redirect(`/admin/content/${resource.key}`);
}

export async function deleteRecord(resourceKey: string, id: string): Promise<void> {
  await requireUser(CONTENT_ROLES);
  const resource = getResource(resourceKey);
  if (!resource) return;
  const existing = await getRecord(resource, id);
  if (existing) {
    await delegateFor(resource).delete({ where: { id } });
    await Promise.all(fileKeysOf(resource, existing).map(deleteStoredFile));
    revalidatePath("/", "layout");
  }
  redirect(`/admin/content/${resource.key}`);
}
