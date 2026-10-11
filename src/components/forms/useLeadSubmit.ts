"use client";

import { useLocale } from "next-intl";
import { useCallback, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { track } from "@/lib/track";

export type FieldErrors = Record<string, string>;

export type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success"; reference: string; emailed: boolean }
  | { status: "error"; error: string; fields: FieldErrors };

export type LeadValues = Record<string, string>;

const PHONE = /^[+\d][\d\s-]{7,17}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the server rules closely enough to catch mistakes before upload; the server stays the authority. */
export function validateFields(values: LeadValues, required: string[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of required) {
    if (!values[field]?.trim()) errors[field] = "required";
  }
  if (values.phone?.trim() && !PHONE.test(values.phone.trim())) errors.phone = "phone";
  if (values.email?.trim() && !EMAIL.test(values.email.trim())) errors.email = "email";
  return errors;
}

export function useLeadSubmit(type: string) {
  const locale = useLocale();
  const pathname = usePathname();
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const submit = useCallback(
    async (values: LeadValues, files: File[] = [], captchaToken = ""): Promise<SubmitState> => {
      setState({ status: "submitting" });
      const body = new FormData();
      body.set("type", type);
      body.set("locale", locale);
      body.set("pagePath", pathname);
      for (const [key, value] of Object.entries(values)) {
        if (value) body.set(key, value);
      }
      for (const file of files) body.append("files", file);
      if (captchaToken) body.set("captchaToken", captchaToken);

      let result: SubmitState;
      try {
        const response = await fetch("/api/leads", { method: "POST", body });
        const data = (await response.json().catch(() => ({}))) as {
          reference?: string;
          emailed?: boolean;
          error?: string;
          fields?: FieldErrors;
        };
        if (response.ok && data.reference) {
          track("generate_lead", { lead_type: type });
          result = { status: "success", reference: data.reference, emailed: Boolean(data.emailed) };
        } else {
          result = { status: "error", error: data.error ?? "generic", fields: data.fields ?? {} };
        }
      } catch {
        result = { status: "error", error: "generic", fields: {} };
      }
      setState(result);
      return result;
    },
    [type, locale, pathname],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}

/** Converts a `datetime-local` value (browser local time) to an ISO string. */
export function localDateTimeToIso(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
