import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { siteConfig } from "@/config/site";

/**
 * Local-disk storage. Keys look like "leads/<id>/<uuid>.pdf" (private) or
 * "media/<uuid>.jpg" (public, served by /media/*). Swap this module for an
 * S3 client later without touching callers.
 */
const root = path.resolve(siteConfig.uploads.dir);

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  dwg: "application/acad",
  dxf: "application/dxf",
  zip: "application/zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];

export function extensionOf(filename: string): string {
  return path.extname(filename).slice(1).toLowerCase();
}

export function mimeOf(filename: string): string {
  return MIME[extensionOf(filename)] ?? "application/octet-stream";
}

function resolveKey(key: string): string {
  const full = path.resolve(root, key);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error("Invalid storage key");
  }
  return full;
}

export async function saveFile(folder: string, file: File): Promise<{ key: string; name: string; mime: string; size: number }> {
  const ext = extensionOf(file.name);
  const key = `${folder}/${randomUUID()}${ext ? `.${ext}` : ""}`;
  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));
  return { key, name: file.name, mime: mimeOf(file.name), size: file.size };
}

export async function readStoredFile(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveKey(key));
  } catch {
    return null;
  }
}

export async function deleteStoredFile(key: string): Promise<void> {
  try {
    await unlink(resolveKey(key));
  } catch {
    // already gone
  }
}
