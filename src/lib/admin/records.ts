import "server-only";
import { prisma } from "@/lib/db";
import type { Resource } from "./resources";

export type Row = Record<string, unknown> & { id: string };

// The CMS treats every content model through this minimal shared shape.
type Delegate = {
  findMany(args: { orderBy: Resource["orderBy"] }): Promise<Row[]>;
  findUnique(args: { where: { id: string } }): Promise<Row | null>;
  create(args: { data: Record<string, unknown> }): Promise<Row>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<Row>;
  delete(args: { where: { id: string } }): Promise<Row>;
};

export function delegateFor(resource: Resource): Delegate {
  return prisma[resource.model] as unknown as Delegate;
}

export function listRecords(resource: Resource): Promise<Row[]> {
  return delegateFor(resource).findMany({ orderBy: resource.orderBy });
}

export function getRecord(resource: Resource, id: string): Promise<Row | null> {
  return delegateFor(resource).findUnique({ where: { id } });
}

/** Storage keys referenced by a record's image/file fields. */
export function fileKeysOf(resource: Resource, row: Row): string[] {
  return resource.fields.flatMap((field) => {
    const value = row[field.name];
    if (field.type === "images") return Array.isArray(value) ? (value as string[]) : [];
    if (field.type === "image" || field.type === "file") return typeof value === "string" && value ? [value] : [];
    return [];
  });
}
