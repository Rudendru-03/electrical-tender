import "server-only";
import { siteConfig } from "@/config/site";
import { CLIENT_TYPE_LABELS, LEAD_TYPE_LABELS } from "@/lib/leads";
import { sendMail } from "@/lib/mail";
import type { Lead, LeadFile } from "@/generated/prisma/client";

function inbox(type: Lead["type"]): string {
  const { emails } = siteConfig.contact;
  if (type === "TENDER") return emails.tenders || emails.sales;
  if (type === "CAREER") return emails.careers || emails.sales;
  return emails.sales;
}

function formatDate(date: Date | null, withTime = false): string {
  if (!date) return "";
  return date.toLocaleString("en-IN", {
    timeZone: siteConfig.admin.timeZone,
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  });
}

const ACK: Record<string, { subject: (ref: string) => string; body: (name: string, ref: string, site: string) => string }> = {
  en: {
    subject: (ref) => `We received your request (${ref})`,
    body: (name, ref, site) =>
      `Dear ${name},\n\nThank you for contacting ${site}. We have received your request.\n\nReference number: ${ref}\n\nOur team will review it and get back to you. Please quote the reference number in any follow-up.\n\nRegards,\n${site}`,
  },
  hi: {
    subject: (ref) => `आपकी रिक्वेस्ट हमें मिल गई है (${ref})`,
    body: (name, ref, site) =>
      `नमस्ते ${name},\n\n${site} से संपर्क करने के लिए धन्यवाद। आपकी रिक्वेस्ट हमें मिल गई है।\n\nरेफरेंस नंबर: ${ref}\n\nहमारी टीम इसे देखकर आपसे संपर्क करेगी। आगे की बातचीत में कृपया यह रेफरेंस नंबर बताएँ।\n\nसादर,\n${site}`,
  },
};

/** Sends the internal alert and the visitor's acknowledgement for a new website lead. */
export async function notifyNewLead(lead: Lead & { files: LeadFile[] }): Promise<void> {
  const rows: [string, string | null | undefined][] = [
    ["Reference", lead.reference],
    ["Type", LEAD_TYPE_LABELS[lead.type]],
    ["Name", lead.name],
    ["Organisation", lead.organisation],
    ["Client type", lead.clientType ? CLIENT_TYPE_LABELS[lead.clientType] : null],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Location", [lead.city, lead.state].filter(Boolean).join(", ")],
    ["Work type", lead.workType],
    ["Estimated value", lead.estimatedValue],
    ["Due date", formatDate(lead.deadline)],
    ["Preferred time", formatDate(lead.preferredAt, true)],
    ["Position", lead.position],
    ["Files", lead.files.map((file) => file.name).join(", ")],
    ["Message", lead.message],
  ];
  const details = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  await Promise.all([
    sendMail({
      to: inbox(lead.type),
      subject: `[${LEAD_TYPE_LABELS[lead.type]}] ${lead.reference} - ${lead.organisation ?? lead.name}`,
      text: `${details}\n\nOpen in admin: ${siteConfig.url}/admin/leads/${lead.id}`,
      replyTo: lead.email ?? undefined,
    }),
    lead.email
      ? sendMail({
          to: lead.email,
          subject: (ACK[lead.locale] ?? ACK.en).subject(lead.reference),
          text: (ACK[lead.locale] ?? ACK.en).body(lead.name, lead.reference, siteConfig.name),
        })
      : Promise.resolve(),
  ]);
}
