"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import type { FormSettings } from "@/config/site";
import { buttonClass } from "@/components/ui";
import { Captcha, Field, FileInput, FormError, Honeypot, SuccessPanel, inputClass } from "./fields";
import { type FieldErrors, type LeadValues, useLeadSubmit, validateFields } from "./useLeadSubmit";

const REQUIRED = ["name", "phone", "email", "position"];

export function CareerForm({
  settings,
  positions,
  generalLabel,
  siteName,
}: {
  settings: FormSettings;
  positions: string[];
  generalLabel: string;
  siteName: string;
}) {
  const t = useTranslations("form");
  const { state, submit, reset } = useLeadSubmit("CAREER");
  const empty: LeadValues = { name: "", phone: "", email: "", position: positions.length === 0 ? generalLabel : "", message: "", website: "" };
  const [values, setValues] = useState<LeadValues>(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState("");
  const submitting = state.status === "submitting";

  function set(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateFields(values, REQUIRED);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const result = await submit(values, files, captchaToken);
    if (result.status === "error") setErrors(result.fields);
  }

  if (state.status === "success") {
    return (
      <SuccessPanel
        reference={state.reference}
        emailed={state.emailed}
        whatsapp=""
        siteName={siteName}
        onReset={() => {
          setValues(empty);
          setFiles([]);
          setCaptchaToken("");
          reset();
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
      <Honeypot value={values.website} onChange={(value) => set("website", value)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} error={errors.name}>
          {(props) => (
            <input {...props} className={inputClass} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
          )}
        </Field>
        <Field label={t("phone")} error={errors.phone}>
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="tel"
              className={inputClass}
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          )}
        </Field>
        <Field label={t("email")} error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              className={inputClass}
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          )}
        </Field>
        <Field label={t("position")} error={errors.position}>
          {(props) => (
            <select {...props} className={inputClass} value={values.position} onChange={(e) => set("position", e.target.value)}>
              {positions.length > 0 ? <option value="">{t("select")}</option> : null}
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
              <option value={generalLabel}>{generalLabel}</option>
            </select>
          )}
        </Field>
        <div className="sm:col-span-2">
          <FileInput
            label={t("resume")}
            files={files}
            settings={settings}
            multiple={false}
            error={fileError}
            onChange={(next, error) => {
              setFiles(next);
              setFileError(error);
            }}
          />
        </div>
        <Field label={t("message")} error={errors.message} optional className="sm:col-span-2">
          {(props) => (
            <textarea {...props} rows={4} className={inputClass} value={values.message} onChange={(e) => set("message", e.target.value)} />
          )}
        </Field>
      </div>
      <div className="mt-6 grid gap-4">
        <Captcha siteKey={settings.turnstileSiteKey} onToken={setCaptchaToken} />
        <FormError error={state.status === "error" ? state.error : undefined} />
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className={buttonClass("primary")}>
            {submitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </div>
    </form>
  );
}
