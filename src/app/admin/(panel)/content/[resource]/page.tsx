import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTENT_ROLES, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/admin/format";
import { listRecords } from "@/lib/admin/records";
import { getResource } from "@/lib/admin/resources";
import { Badge, PageHeader, adminButton } from "@/components/admin/ui";

type Props = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resource = getResource((await params).resource);
  return { title: resource?.label ?? "Content" };
}

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return formatDate(value);
  if (Array.isArray(value)) return String(value.length);
  return String(value);
}

export default async function ContentListPage({ params }: Props) {
  await requireUser(CONTENT_ROLES);
  const resource = getResource((await params).resource);
  if (!resource) notFound();
  const records = await listRecords(resource);
  const label = (name: string) => resource.fields.find((field) => field.name === name)?.label ?? name;

  return (
    <>
      <PageHeader
        title={resource.label}
        text={`${records.length} ${records.length === 1 ? "item" : "items"}`}
        action={
          <Link href={`/admin/content/${resource.key}/new`} className={adminButton}>
            Add {resource.singular}
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {resource.listFields.map((name) => (
                <th key={name} className="px-4 py-3 font-medium">
                  {label(name)}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Visibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50">
                {resource.listFields.map((name, index) => (
                  <td key={name} className="px-4 py-3 text-slate-700">
                    {index === 0 ? (
                      <Link href={`/admin/content/${resource.key}/${record.id}`} className="font-medium text-brand-700 hover:underline">
                        {cell(record[name])}
                      </Link>
                    ) : (
                      cell(record[name])
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  {record[resource.visibleField] ? <Badge tone="WON">Live</Badge> : <Badge tone="CLOSED">Hidden</Badge>}
                </td>
              </tr>
            ))}
            {records.length === 0 ? (
              <tr>
                <td colSpan={resource.listFields.length + 1} className="px-4 py-10 text-center text-slate-500">
                  Nothing here yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
