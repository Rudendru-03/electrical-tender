import type { Metadata } from "next";
import Link from "next/link";
import { LEAD_ROLES, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db";
import { LEAD_SOURCES, LEAD_SOURCE_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPES, LEAD_TYPE_LABELS } from "@/lib/leads";
import type { Prisma } from "@/generated/prisma/client";
import { Badge, PageHeader, adminButton, adminButtonSecondary, adminInput } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((item) => item === value);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireUser(LEAD_ROLES);
  const params = await searchParams;
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);

  const status = pick(one("status"), LEAD_STATUSES);
  const type = pick(one("type"), LEAD_TYPES);
  const source = pick(one("source"), LEAD_SOURCES);
  const q = one("q")?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(one("page") ?? "1", 10) || 1);

  const where: Prisma.LeadWhereInput = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(source ? { source } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { organisation: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { name: true } }, _count: { select: { files: true } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (type) query.set("type", type);
    if (source) query.set("source", source);
    if (q) query.set("q", q);
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `/admin/leads?${text}` : "/admin/leads";
  };

  return (
    <>
      <PageHeader
        title="Leads"
        text={`${total} ${total === 1 ? "enquiry" : "enquiries"}`}
        action={
          <Link href="/admin/leads/new" className={adminButton}>
            Add lead
          </Link>
        }
      />

      <form className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="Search reference, name, phone…" aria-label="Search" className={adminInput} />
        <select name="status" defaultValue={status ?? ""} aria-label="Status" className={adminInput}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((item) => (
            <option key={item} value={item}>
              {LEAD_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} aria-label="Type" className={adminInput}>
          <option value="">All types</option>
          {LEAD_TYPES.map((item) => (
            <option key={item} value={item}>
              {LEAD_TYPE_LABELS[item]}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={source ?? ""} aria-label="Channel" className={adminInput}>
          <option value="">All channels</option>
          {LEAD_SOURCES.map((item) => (
            <option key={item} value={item}>
              {LEAD_SOURCE_LABELS[item]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={adminButton}>
            Filter
          </button>
          <Link href="/admin/leads" className={adminButtonSecondary}>
            Reset
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assigned</th>
              <th className="px-4 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-mono font-medium text-brand-700 hover:underline">
                    {lead.reference}
                  </Link>
                  {lead._count.files > 0 ? <span className="ml-2 text-xs text-slate-400">{lead._count.files} file(s)</span> : null}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{lead.organisation ?? lead.name}</span>
                  <span className="block text-xs text-slate-500">
                    {lead.organisation ? `${lead.name} · ` : ""}
                    {lead.phone}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{LEAD_TYPE_LABELS[lead.type]}</td>
                <td className="px-4 py-3 text-slate-700">{LEAD_SOURCE_LABELS[lead.source]}</td>
                <td className="px-4 py-3">
                  <Badge tone={lead.status}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-700">{lead.assignedTo?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(lead.createdAt, true)}</td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No leads match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={adminButtonSecondary}>
                Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={pageHref(page + 1)} className={adminButtonSecondary}>
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
