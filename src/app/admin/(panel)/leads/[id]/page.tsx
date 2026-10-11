import { Mail, Paperclip, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_ONLY, LEAD_ROLES, hasRole, requireUser } from "@/lib/auth";
import { formatBytes, formatDate } from "@/lib/admin/format";
import { prisma } from "@/lib/db";
import { CLIENT_TYPE_LABELS, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/leads";
import { ConfirmButton, LeadUpdateForm, NoteForm } from "@/components/admin/forms";
import { Badge, PageHeader, Panel, adminButtonSecondary } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { addLeadNote, deleteLead, updateLead } from "../../../_actions/leads";

export const metadata: Metadata = { title: "Lead" };

/** wa.me needs the number in international format; 10-digit numbers are assumed to be Indian. */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(LEAD_ROLES);
  const { id } = await params;
  const [lead, users] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        files: { orderBy: { createdAt: "asc" } },
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      },
    }),
    prisma.adminUser.findMany({
      where: { active: true, role: { in: LEAD_ROLES } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!lead) notFound();

  const details: [string, string | null | undefined][] = [
    ["Organisation", lead.organisation],
    ["Client type", lead.clientType ? CLIENT_TYPE_LABELS[lead.clientType] : null],
    ["Location", [lead.city, lead.state].filter(Boolean).join(", ")],
    ["Type of work", lead.workType],
    ["Estimated value", lead.estimatedValue],
    ["Due date", formatDate(lead.deadline)],
    ["Preferred time", formatDate(lead.preferredAt, true)],
    ["Position applied for", lead.position],
    ["Submitted from", lead.pagePath ? `${lead.pagePath} (${lead.locale})` : null],
    ["Received", formatDate(lead.createdAt, true)],
  ];

  return (
    <>
      <PageHeader
        title={lead.reference}
        text={`${LEAD_TYPE_LABELS[lead.type]} from ${lead.organisation ?? lead.name}`}
        action={
          <Link href="/admin/leads" className={adminButtonSecondary}>
            Back to leads
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Contact">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{lead.name}</p>
                <p className="text-sm text-slate-600">
                  {lead.phone}
                  {lead.email ? ` · ${lead.email}` : ""}
                </p>
              </div>
              <Badge tone={lead.status}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
            </div>
            {/* Reply on whichever channel suits the client. */}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className={adminButtonSecondary}>
                <Phone className="h-4 w-4" aria-hidden />
                Call
              </a>
              <a
                href={`https://wa.me/${whatsappNumber(lead.phone)}?text=${encodeURIComponent(`Regarding your enquiry ${lead.reference}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={adminButtonSecondary}
              >
                <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
                WhatsApp
              </a>
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your enquiry ${lead.reference}`)}`}
                  className={adminButtonSecondary}
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email
                </a>
              ) : null}
            </div>
          </Panel>

          <Panel title="Enquiry details">
            <dl className="divide-y divide-slate-100">
              {details
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-2.5 text-sm first:pt-0 sm:grid-cols-3">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900 sm:col-span-2">{value}</dd>
                  </div>
                ))}
            </dl>
            {lead.message ? (
              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{lead.message}</p>
              </div>
            ) : null}
          </Panel>

          <Panel title={`Files (${lead.files.length})`}>
            {lead.files.length === 0 ? <p className="text-sm text-slate-500">No files attached.</p> : null}
            <ul className="space-y-2">
              {lead.files.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/admin/files/${file.id}`}
                    className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-medium text-brand-700">{file.name}</span>
                    <span className="shrink-0 text-xs text-slate-500">{formatBytes(file.size)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Notes and follow-ups">
            <NoteForm action={addLeadNote.bind(null, lead.id)} />
            <ul className="mt-6 space-y-4">
              {lead.notes.map((note) => (
                <li key={note.id} className="border-l-2 border-slate-200 pl-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{note.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {note.author?.name ?? "Removed user"} · {formatDate(note.createdAt, true)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Handling">
            <LeadUpdateForm
              action={updateLead.bind(null, lead.id)}
              lead={{ status: lead.status, source: lead.source, assignedToId: lead.assignedToId }}
              users={users}
            />
          </Panel>
          {hasRole(user, ADMIN_ONLY) ? (
            <Panel title="Delete">
              <p className="mb-3 text-sm text-slate-600">Removes the lead with its notes and attached files. This cannot be undone.</p>
              <ConfirmButton
                action={deleteLead.bind(null, lead.id)}
                label="Delete lead"
                message={`Delete lead ${lead.reference} and its files? This cannot be undone.`}
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
