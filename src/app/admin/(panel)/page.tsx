import Link from "next/link";
import { LEAD_ROLES, hasRole, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/leads";
import { Badge, PageHeader, Panel } from "@/components/admin/ui";

const OPEN_STATUSES = ["NEW", "IN_REVIEW", "QUOTED"] as const;

function Breakdown({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (rows.length === 0) return <p className="text-sm text-slate-500">No leads yet.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">{row.label}</span>
            <span className="font-medium text-slate-900">{row.count}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

async function loadDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const [fresh, open, last30, won30, bySource, byType, byStatus, dueSoon, recent] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: { in: [...OPEN_STATUSES] } } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { status: "WON", updatedAt: { gte: since } } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
    prisma.lead.groupBy({ by: ["type"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.findMany({
      where: { deadline: { gte: today }, status: { in: [...OPEN_STATUSES] } },
      orderBy: { deadline: "asc" },
      take: 6,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return { fresh, open, last30, won30, bySource, byType, byStatus, dueSoon, recent };
}

export default async function DashboardPage() {
  const user = await requireUser();

  if (!hasRole(user, LEAD_ROLES)) {
    return <PageHeader title={`Welcome, ${user.name}`} text="Use the menu to manage website content." />;
  }

  const { fresh, open, last30, won30, bySource, byType, byStatus, dueSoon, recent } = await loadDashboard();

  const stats = [
    { label: "New, not yet reviewed", value: fresh },
    { label: "Open leads", value: open },
    { label: "Leads in last 30 days", value: last30 },
    { label: "Awarded in last 30 days", value: won30 },
  ];
  const sorted = <T extends { _count: { _all: number } }>(rows: T[]) => [...rows].sort((a, b) => b._count._all - a._count._all);

  return (
    <>
      <PageHeader title="Dashboard" text="Enquiries from every channel in one place." />
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm text-slate-600">{stat.label}</dt>
            <dd className="mt-1 text-3xl font-semibold text-slate-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="By channel (30 days)">
          <Breakdown rows={sorted(bySource).map((row) => ({ label: LEAD_SOURCE_LABELS[row.source], count: row._count._all }))} />
        </Panel>
        <Panel title="By enquiry type (30 days)">
          <Breakdown rows={sorted(byType).map((row) => ({ label: LEAD_TYPE_LABELS[row.type], count: row._count._all }))} />
        </Panel>
        <Panel title="By status (all time)">
          <Breakdown rows={sorted(byStatus).map((row) => ({ label: LEAD_STATUS_LABELS[row.status], count: row._count._all }))} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Upcoming due dates">
          {dueSoon.length === 0 ? <p className="text-sm text-slate-500">No open enquiries with a due date.</p> : null}
          <ul className="divide-y divide-slate-100">
            {dueSoon.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0">
                <Link href={`/admin/leads/${lead.id}`} className="min-w-0 truncate font-medium text-brand-700 hover:underline">
                  {lead.organisation ?? lead.name}
                </Link>
                <span className="shrink-0 text-slate-600">{formatDate(lead.deadline)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Latest leads">
          {recent.length === 0 ? <p className="text-sm text-slate-500">No leads yet.</p> : null}
          <ul className="divide-y divide-slate-100">
            {recent.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0">
                <Link href={`/admin/leads/${lead.id}`} className="min-w-0 truncate font-medium text-brand-700 hover:underline">
                  {lead.reference} · {lead.organisation ?? lead.name}
                </Link>
                <Badge tone={lead.status}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
