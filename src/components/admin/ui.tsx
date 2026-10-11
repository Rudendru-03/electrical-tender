import type { ReactNode } from "react";
import { cn } from "@/components/ui";

export const adminInput =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export const adminButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60";

export const adminButtonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60";

export const adminButtonDanger =
  "inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60";

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {text ? <p className="mt-1 text-sm text-slate-600">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white", className)}>
      {title ? <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900">{title}</h2> : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

const STATUS_TONES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-900",
  IN_REVIEW: "bg-sky-100 text-sky-900",
  QUOTED: "bg-violet-100 text-violet-900",
  WON: "bg-emerald-100 text-emerald-900",
  LOST: "bg-red-100 text-red-900",
  CLOSED: "bg-slate-200 text-slate-700",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", (tone && STATUS_TONES[tone]) || "bg-slate-100 text-slate-700")}>
      {children}
    </span>
  );
}

export function ActionMessage({ state }: { state: { error?: string; ok?: string } }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        {state.ok}
      </p>
    );
  }
  return null;
}

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}
