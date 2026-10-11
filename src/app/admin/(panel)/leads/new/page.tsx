import type { Metadata } from "next";
import { LEAD_ROLES, requireUser } from "@/lib/auth";
import { NewLeadForm } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { createLead } from "../../../_actions/leads";

export const metadata: Metadata = { title: "Add lead" };

export default async function NewLeadPage() {
  await requireUser(LEAD_ROLES);
  return (
    <>
      <PageHeader title="Add lead" text="Record an enquiry that came by phone, WhatsApp, email or any other channel." />
      <Panel className="max-w-3xl">
        <NewLeadForm action={createLead} />
      </Panel>
    </>
  );
}
