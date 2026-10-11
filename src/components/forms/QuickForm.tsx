"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import type { FormSettings } from "@/config/site";
import { CLIENT_TYPES } from "@/lib/leads";
import { buttonClass } from "@/components/ui";
import { Captcha, Field, FileInput, FormError, Honeypot, SuccessPanel, inputClass } from "./fields";
import { type FieldErrors, type LeadValues, localDateTimeToIso, useLeadSubmit, validateFields } from "./useLeadSubmit";

export type QuickFormType = "QUOTE" | "SITE_VISIT" | "CALLBACK" | "CONTACT";

// Which fields each short form shows, and which of them are mandatory.
const LAYOUT: Record<QuickFormType, { fields: string[]; required: string[] }> = {
  QUOTE: {
    fields: ["name", "phone", "email", "clientType", "workType", "city", "message", "files"],
    required: ["name", "phone", "workType", "city"],
  },
  SITE_VISIT: {
    fields: ["name", "phone", "email", "city", "preferredAt", "workType", "message"],
    required: ["name", "phone", "city", "preferredAt"],
  },
  CALLBACK: {
    fields: ["name", "phone", "preferredAt", "message"],
    required: ["name", "phone"],
  },
  CONTACT: {
    fields: ["name", "phone", "email", "message"],
    required: ["name", "phone", "message"],
  },
};

const EMPTY: LeadValues = {
  name: "",
  phone: "",
  email: "",
  clientType: "",
  workType: "",
  city: "",
  preferredAt: "",
  message: "",
  website: "",
};

export function QuickForm({
  type,
  settings,
  workTypes = [],
  siteName,
}: {
  type: QuickFormType;
  settings: FormSettings;
  workTypes?: string[];
  siteName: string;
}) {
  const t = useTranslations("form");
  const { state, submit, reset } = useLeadSubmit(type);
  const [values, setValues] = useState<LeadValues>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState("");

  const { fields, required } = LAYOUT[type];
  const has = (name: string) => fields.includes(name);
  const isOptional = (name: string) => !required.includes(name);
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
    const found = validateFields(values, required);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const result = await submit({ ...values, preferredAt: localDateTimeToIso(values.preferredAt) }, files, captchaToken);
    if (result.status === "error") setErrors(result.fields);
  }

  if (state.status === "success") {
    return (
      <SuccessPanel
        reference={state.reference}
        emailed={state.emailed}
        whatsapp={settings.whatsapp}
        siteName={siteName}
        onReset={() => {
          setValues(EMPTY);
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
        {has("email") ? (
          <Field label={t("email")} error={errors.email} optional={isOptional("email")}>
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
        ) : null}
        {has("clientType") ? (
          <Field label={t("clientType")} error={errors.clientType} optional>
            {(props) => (
              <select {...props} className={inputClass} value={values.clientType} onChange={(e) => set("clientType", e.target.value)}>
                <option value="">{t("select")}</option>
                {CLIENT_TYPES.map((clientType) => (
                  <option key={clientType} value={clientType}>
                    {t(`clientTypes.${clientType}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        {has("city") ? (
          <Field label={t("city")} error={errors.city} optional={isOptional("city")}>
            {(props) => <input {...props} className={inputClass} value={values.city} onChange={(e) => set("city", e.target.value)} />}
          </Field>
        ) : null}
        {has("preferredAt") ? (
          <Field
            label={type === "SITE_VISIT" ? t("preferredVisit") : t("preferredCall")}
            error={errors.preferredAt}
            optional={isOptional("preferredAt")}
          >
            {(props) => (
              <input
                {...props}
                type="datetime-local"
                className={inputClass}
                value={values.preferredAt}
                onChange={(e) => set("preferredAt", e.target.value)}
              />
            )}
          </Field>
        ) : null}
        {has("workType") ? (
          <Field label={t("workType")} error={errors.workType} optional={isOptional("workType")} className="sm:col-span-2">
            {(props) => (
              <select {...props} className={inputClass} value={values.workType} onChange={(e) => set("workType", e.target.value)}>
                <option value="">{t("select")}</option>
                {workTypes.map((workType) => (
                  <option key={workType} value={workType}>
                    {workType}
                  </option>
                ))}
                <option value={t("workTypeOther")}>{t("workTypeOther")}</option>
              </select>
            )}
          </Field>
        ) : null}
        <Field label={t("message")} error={errors.message} optional={isOptional("message")} className="sm:col-span-2">
          {(props) => (
            <textarea {...props} rows={4} className={inputClass} value={values.message} onChange={(e) => set("message", e.target.value)} />
          )}
        </Field>
        {has("files") ? (
          <div className="sm:col-span-2">
            <FileInput
              label={t("files")}
              files={files}
              settings={settings}
              error={fileError}
              onChange={(next, error) => {
                setFiles(next);
                setFileError(error);
              }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4">
        <Captcha siteKey={settings.turnstileSiteKey} onToken={setCaptchaToken} />
        <FormError error={state.status === "error" ? state.error : undefined} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{t("consent")}</p>
          <button type="submit" disabled={submitting} className={buttonClass("primary")}>
            {submitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </div>
    </form>
  );
}
