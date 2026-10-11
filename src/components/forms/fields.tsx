"use client";

import { CheckCircle2, Paperclip, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef } from "react";
import type { FormSettings } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { TrackedLink } from "@/components/TrackedLink";
import { buttonClass, cn } from "@/components/ui";

export const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 aria-[invalid=true]:border-red-500";

export function Field({
  label,
  error,
  optional,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const t = useTranslations("form");
  const id = useId();
  const messageId = `${id}-message`;
  const knownErrors = ["required", "email", "phone", "invalid"] as const;
  const errorKey = knownErrors.find((key) => key === error) ?? "invalid";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {optional ? <span className="ml-1 font-normal text-slate-400">({t("optional")})</span> : null}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error || hint ? messageId : undefined })}
      {error ? (
        <p id={messageId} className="mt-1.5 text-xs text-red-600">
          {t(`errors.${errorKey}`)}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FileInput({
  label,
  files,
  onChange,
  settings,
  multiple = true,
  optional = true,
  error,
}: {
  label: string;
  files: File[];
  onChange: (files: File[], error?: string) => void;
  settings: FormSettings;
  multiple?: boolean;
  optional?: boolean;
  error?: string;
}) {
  const t = useTranslations("form");
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const maxFiles = multiple ? settings.maxFiles : 1;

  function add(selected: FileList | null) {
    if (!selected) return;
    const next = multiple ? [...files, ...Array.from(selected)] : Array.from(selected).slice(0, 1);
    let problem: string | undefined;
    if (next.length > maxFiles) problem = "fileCount";
    if (next.some((file) => file.size > settings.maxSizeMb * 1024 * 1024)) problem = "fileSize";
    if (next.some((file) => !settings.allowedExt.includes(file.name.split(".").pop()?.toLowerCase() ?? ""))) {
      problem = "fileType";
    }
    onChange(problem ? files : next, problem);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {optional ? <span className="ml-1 font-normal text-slate-400">({t("optional")})</span> : null}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept={settings.allowedExt.map((ext) => `.${ext}`).join(",")}
        onChange={(event) => add(event.target.files)}
        className="block w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-brand-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{t(`errors.${error as "fileCount" | "fileSize" | "fileType"}`)}</p>
      ) : (
        <p className="mt-1.5 text-xs text-slate-500">
          {t("filesHint", { maxFiles, maxSize: settings.maxSizeMb, types: settings.allowedExt.join(", ").toUpperCase() })}
        </p>
      )}
      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <Paperclip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string;
  remove: (id: string) => void;
};

/** Cloudflare Turnstile widget. Renders nothing when no site key is configured. */
export function Captcha({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const element = ref.current;
    let widgetId: string | undefined;
    let cancelled = false;
    const getApi = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

    const render = () => {
      const api = getApi();
      if (cancelled || !api) return;
      widgetId = api.render(element, { sitekey: siteKey, callback: onToken, "expired-callback": () => onToken("") });
    };

    if (getApi()) {
      render();
    } else {
      const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }

    return () => {
      cancelled = true;
      if (widgetId) getApi()?.remove(widgetId);
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} />;
}

/** Hidden field real visitors leave empty; bots that fill it are dropped by the server. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function FormError({ error }: { error?: string }) {
  const t = useTranslations("form.errors");
  if (!error) return null;
  const known = ["fileCount", "fileSize", "fileType", "captcha", "rateLimit", "generic"] as const;
  const key = error === "validation" ? "fix" : (known.find((item) => item === error) ?? "generic");
  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {t(key)}
    </p>
  );
}

export function SuccessPanel({
  reference,
  emailed,
  whatsapp,
  siteName,
  onReset,
}: {
  reference: string;
  emailed: boolean;
  whatsapp: string;
  siteName: string;
  onReset: () => void;
}) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 outline-none sm:p-8">
      <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
      <h3 className="mt-3 text-xl font-semibold text-brand-900">{t("form.successTitle")}</h3>
      <p className="mt-1.5 text-sm text-slate-700">{t("form.successText")}</p>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("form.successReference")}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-wide text-brand-900">{reference}</p>
      {emailed ? <p className="mt-3 text-sm text-slate-600">{t("form.successEmail")}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {whatsapp ? (
          <TrackedLink
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t("whatsapp.withReference", { name: siteName, reference }))}`}
            event="click_whatsapp"
            eventLabel="lead_success"
            className={buttonClass("whatsapp")}
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("form.continueWhatsapp")}
          </TrackedLink>
        ) : null}
        <button type="button" onClick={onReset} className={buttonClass("outline")}>
          {t("form.another")}
        </button>
      </div>
    </div>
  );
}

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <li key={step} aria-current={index === current ? "step" : undefined}>
          <div className={cn("h-1.5 rounded-full", index <= current ? "bg-amber-400" : "bg-slate-200")} />
          <p className={cn("mt-2 text-xs font-medium sm:text-sm", index === current ? "text-brand-900" : "text-slate-500")}>
            <span className="mr-1">{index + 1}.</span>
            <span className={index === current ? "" : "hidden sm:inline"}>{step}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
