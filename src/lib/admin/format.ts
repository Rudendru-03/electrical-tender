import "server-only";
import { siteConfig } from "@/config/site";

/** Dates in the admin panel are shown in the configured office time zone. */
export function formatDate(date: Date | null | undefined, withTime = false): string {
  if (!date) return "";
  return date.toLocaleString("en-IN", {
    timeZone: siteConfig.admin.timeZone,
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
