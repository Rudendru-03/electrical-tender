import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTENT_ROLES, requireUser } from "@/lib/auth";
import { getRecord } from "@/lib/admin/records";
import { getResource } from "@/lib/admin/resources";
import { ConfirmButton } from "@/components/admin/forms";
import { RecordForm, type RecordValues } from "@/components/admin/RecordForm";
import { PageHeader, Panel } from "@/components/admin/ui";
import { deleteRecord, saveRecord } from "../../../../_actions/content";

type Props = { params: Promise<{ resource: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  return { title: resource ? `${id === "new" ? "Add" : "Edit"} ${resource.singular}` : "Content" };
}

export default async function ContentEditPage({ params }: Props) {
  await requireUser(CONTENT_ROLES);
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const isNew = id === "new";
  const record = isNew ? null : await getRecord(resource, id);
  if (!isNew && !record) notFound();

  // Only the editable fields cross to the client, with dates as ISO strings.
  const values: RecordValues | null = record
    ? Object.fromEntries(
        resource.fields.map((field) => {
          const value = record[field.name];
          return [field.name, value instanceof Date ? value.toISOString() : (value as RecordValues[string]) ?? null];
        }),
      )
    : null;
  const title = record ? String(record[resource.titleField]) : `Add ${resource.singular}`;

  return (
    <>
      <PageHeader title={title} text={resource.label} />
      <div className="max-w-3xl space-y-6">
        <Panel>
          <RecordForm resource={resource} record={values} action={saveRecord.bind(null, resource.key, record?.id ?? null)} />
        </Panel>
        {record ? (
          <Panel title="Delete">
            <p className="mb-3 text-sm text-slate-600">Removes this {resource.singular} from the website. This cannot be undone.</p>
            <ConfirmButton
              action={deleteRecord.bind(null, resource.key, record.id)}
              label={`Delete ${resource.singular}`}
              message={`Delete "${title}"? This cannot be undone.`}
            />
          </Panel>
        ) : null}
      </div>
    </>
  );
}
