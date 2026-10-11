"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/resources";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS, LEAD_SOURCES, LEAD_SOURCE_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPES, LEAD_TYPE_LABELS } from "@/lib/leads";
import { ActionMessage, Label, adminButton, adminButtonDanger, adminInput } from "./ui";

type Action = (previous: ActionState, formData: FormData) => Promise<ActionState>;

const EMPTY: ActionState = {};

export function LoginForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.values?.email} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={adminInput} />
      </div>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className={`${adminButton} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function LeadUpdateForm({
  action,
  lead,
  users,
}: {
  action: Action;
  lead: { status: string; source: string; assignedToId: string | null };
  users: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={lead.status} className={adminInput}>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="assignedToId">Assigned to</Label>
        <select id="assignedToId" name="assignedToId" defaultValue={lead.assignedToId ?? ""} className={adminInput}>
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="source">Source channel</Label>
        <select id="source" name="source" defaultValue={lead.source} className={adminInput}>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {LEAD_SOURCE_LABELS[source]}
            </option>
          ))}
        </select>
      </div>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className={adminButton}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function NoteForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="space-y-3">
      <Label htmlFor="body">Add a note</Label>
      <textarea id="body" name="body" rows={3} required defaultValue={state.values?.body} className={adminInput} placeholder="Call summary, follow-up date, quotation sent…" />
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className={adminButton}>
        {pending ? "Adding…" : "Add note"}
      </button>
    </form>
  );
}

export function NewLeadForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  const value = (name: string) => state.values?.[name] ?? "";
  const error = (name: string) =>
    state.fields?.[name] ? <p className="mt-1 text-xs text-red-600">{state.fields[name]}</p> : null;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="source">Came through</Label>
        <select id="source" name="source" defaultValue={value("source") || "PHONE"} className={adminInput}>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {LEAD_SOURCE_LABELS[source]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="type">Enquiry type</Label>
        <select id="type" name="type" defaultValue={value("type") || "QUOTE"} className={adminInput}>
          {LEAD_TYPES.map((type) => (
            <option key={type} value={type}>
              {LEAD_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <input id="name" name="name" required defaultValue={value("name")} className={adminInput} />
        {error("name")}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <input id="phone" name="phone" required defaultValue={value("phone")} className={adminInput} />
        {error("phone")}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" name="email" type="email" defaultValue={value("email")} className={adminInput} />
        {error("email")}
      </div>
      <div>
        <Label htmlFor="organisation">Organisation</Label>
        <input id="organisation" name="organisation" defaultValue={value("organisation")} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="clientType">Client type</Label>
        <select id="clientType" name="clientType" defaultValue={value("clientType")} className={adminInput}>
          <option value="">Not known</option>
          {CLIENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CLIENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="city">City / site location</Label>
        <input id="city" name="city" defaultValue={value("city")} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="workType">Type of work</Label>
        <input id="workType" name="workType" defaultValue={value("workType")} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="estimatedValue">Estimated value</Label>
        <input id="estimatedValue" name="estimatedValue" defaultValue={value("estimatedValue")} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="deadline">Due date</Label>
        <input id="deadline" name="deadline" type="date" defaultValue={value("deadline")} className={adminInput} />
        {error("deadline")}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message">Requirement / notes</Label>
        <textarea id="message" name="message" rows={4} defaultValue={value("message")} className={adminInput} />
      </div>
      <div className="space-y-3 sm:col-span-2">
        <ActionMessage state={state} />
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Saving…" : "Create lead"}
        </button>
      </div>
    </form>
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin (everything)",
  SALES: "Sales (leads)",
  CONTENT: "Content (website content)",
};

export function NewUserForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="new-name">Name</Label>
        <input id="new-name" name="name" required defaultValue={state.values?.name} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="new-email">Email</Label>
        <input id="new-email" name="email" type="email" required defaultValue={state.values?.email} className={adminInput} />
      </div>
      <div>
        <Label htmlFor="new-role">Role</Label>
        <select id="new-role" name="role" defaultValue={state.values?.role ?? "SALES"} className={adminInput}>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="new-password">Password</Label>
        <input id="new-password" name="password" type="password" required minLength={10} autoComplete="new-password" className={adminInput} />
      </div>
      <div className="space-y-3 sm:col-span-2">
        <ActionMessage state={state} />
        <button type="submit" disabled={pending} className={adminButton}>
          {pending ? "Creating…" : "Create user"}
        </button>
      </div>
    </form>
  );
}

export function UserRowForm({ action, user }: { action: Action; user: { id: string; role: string; active: boolean } }) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor={`role-${user.id}`}>Role</Label>
        <select id={`role-${user.id}`} name="role" defaultValue={user.role} className={adminInput}>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`password-${user.id}`}>New password</Label>
        <input
          id={`password-${user.id}`}
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          placeholder="Leave empty to keep"
          className={adminInput}
        />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
        <input type="checkbox" name="active" defaultChecked={user.active} className="h-4 w-4" />
        Active
      </label>
      <button type="submit" disabled={pending} className={adminButton}>
        {pending ? "Saving…" : "Save"}
      </button>
      <div className="basis-full">
        <ActionMessage state={state} />
      </div>
    </form>
  );
}

/** Submit button for a destructive action; asks for confirmation first. */
export function ConfirmButton({ action, label, message }: { action: () => Promise<void>; label: string; message: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button type="submit" className={adminButtonDanger}>
        {label}
      </button>
    </form>
  );
}
