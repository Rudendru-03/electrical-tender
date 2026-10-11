"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState, Field, Resource } from "@/lib/admin/resources";
import { mediaUrl } from "@/lib/media";
import { ActionMessage, Label, adminButton, adminButtonSecondary, adminInput } from "./ui";

type Action = (previous: ActionState, formData: FormData) => Promise<ActionState>;

/** Values as the server stored them: strings, numbers, booleans, ISO date strings or string arrays. */
export type RecordValues = Record<string, string | number | boolean | string[] | null>;

function isImage(key: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(key);
}

function FieldInput({ field, record, state }: { field: Field; record: RecordValues | null; state: ActionState }) {
  const id = `field-${field.name}`;
  const stored = record?.[field.name];
  // After a failed save, show what the user typed rather than the stored value.
  const text = (): string => {
    if (state.values) return state.values[field.name] ?? "";
    if (stored === null || stored === undefined) return field.initial !== undefined && !record ? String(field.initial) : "";
    if (Array.isArray(stored)) return stored.join("\n");
    return String(stored);
  };

  switch (field.type) {
    case "textarea":
      return <textarea id={id} name={field.name} rows={3} defaultValue={text()} className={adminInput} />;
    case "markdown":
      return <textarea id={id} name={field.name} rows={12} defaultValue={text()} className={`${adminInput} font-mono`} />;
    case "list":
      return <textarea id={id} name={field.name} rows={6} defaultValue={text()} className={adminInput} />;
    case "number":
      return <input id={id} name={field.name} type="number" step={1} defaultValue={text()} className={adminInput} />;
    case "date":
      return <input id={id} name={field.name} type="date" defaultValue={text().slice(0, 10)} className={adminInput} />;
    case "select":
      return (
        <select id={id} name={field.name} defaultValue={text() || field.options?.[0]} className={adminInput}>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "boolean": {
      const checked = state.values ? state.values[field.name] === "on" : record ? Boolean(stored) : Boolean(field.initial);
      return <input id={id} name={field.name} type="checkbox" defaultChecked={checked} className="h-4 w-4" />;
    }
    case "image":
    case "images":
    case "file": {
      const keys = Array.isArray(stored) ? stored : typeof stored === "string" && stored ? [stored] : [];
      return (
        <div className="space-y-3">
          {keys.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {keys.map((key) => (
                <li key={key} className="rounded-md border border-slate-200 p-2 text-xs">
                  {isImage(key) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin preview of an uploaded file
                    <img src={mediaUrl(key)} alt="" className="h-24 w-32 rounded object-cover" />
                  ) : (
                    <a href={mediaUrl(key)} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                      View file
                    </a>
                  )}
                  <label className="mt-2 flex items-center gap-1.5 text-slate-600">
                    <input type="checkbox" name={`${field.name}__remove`} value={key} className="h-3.5 w-3.5" />
                    Remove
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
          <input
            id={id}
            name={field.name}
            type="file"
            multiple={field.type === "images"}
            accept={field.type === "file" ? undefined : ".jpg,.jpeg,.png,.webp"}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
        </div>
      );
    }
    default:
      return <input id={id} name={field.name} type="text" defaultValue={text()} className={adminInput} />;
  }
}

export function RecordForm({ resource, record, action }: { resource: Resource; record: RecordValues | null; action: Action }) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const wide = (field: Field) => ["textarea", "markdown", "list", "images", "image", "file"].includes(field.type);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {resource.fields.map((field) => (
        <div key={field.name} className={wide(field) ? "sm:col-span-2" : ""}>
          <Label htmlFor={`field-${field.name}`}>
            {field.label}
            {field.required ? <span className="text-red-600"> *</span> : null}
          </Label>
          <FieldInput field={field} record={record} state={state} />
          {state.fields?.[field.name] ? (
            <p className="mt-1 text-xs text-red-600">{state.fields[field.name]}</p>
          ) : field.help ? (
            <p className="mt-1 text-xs text-slate-500">{field.help}</p>
          ) : null}
        </div>
      ))}
      <div className="space-y-3 sm:col-span-2">
        <ActionMessage state={state} />
        <div className="flex gap-3">
          <button type="submit" disabled={pending} className={adminButton}>
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href={`/admin/content/${resource.key}`} className={adminButtonSecondary}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
