"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import type { FormSettings } from "@/config/site";
import { CLIENT_TYPES } from "@/lib/leads";
import { buttonClass } from "@/components/ui";
import { Captcha, Field, FileInput, FormError, Honeypot, StepIndicator, SuccessPanel, inputClass } from "./fields";
import { type FieldErrors, type LeadValues, useLeadSubmit, validateFields } from "./useLeadSubmit";

const EMPTY: LeadValues = {
  name: "",
  organisation: "",
  clientType: "",
  email: "",
  phone: "",
  workType: "",
  city: "",
  state: "",
  estimatedValue: "",
  deadline: "",
  message: "",
  website: "",
};

// Fields validated before leaving each step.
const STEP_REQUIRED: string[][] = [["name", "organisation", "email", "phone"], ["workType", "city"], [], []];
const STEP_FIELDS: string[][] = [
  ["name", "organisation", "clientType", "email", "phone"],
  ["workType", "city", "state", "estimatedValue", "deadline"],
  ["message"],
  [],
];

export function TenderForm({
  settings,
  workTypes,
  siteName,
}: {
  settings: FormSettings;
  workTypes: string[];
  siteName: string;
}) {
  const t = useTranslations("form");
  const { state, submit, reset } = useLeadSubmit("TENDER");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<LeadValues>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState("");

  const steps = [t("steps.organisation"), t("steps.work"), t("steps.documents"), t("steps.review")];
  const lastStep = steps.length - 1;
  const submitting = state.status === "submitting";
  const fieldError = (name: string) => errors[name];

  function set(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function next() {
    const found = validateFields(values, STEP_REQUIRED[step]);
    const relevant = Object.fromEntries(Object.entries(found).filter(([name]) => STEP_FIELDS[step].includes(name)));
    setErrors(relevant);
    if (Object.keys(relevant).length === 0) setStep((current) => Math.min(current + 1, lastStep));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < lastStep) {
      next();
      return;
    }
    const result = await submit(values, files, captchaToken);
    if (result.status === "error") {
      // A field rejected by the server may belong to an earlier step; go back to it.
      const errorStep = STEP_FIELDS.findIndex((names) => names.some((name) => result.fields[name]));
      if (errorStep >= 0) {
        setErrors(result.fields);
        setStep(errorStep);
      }
    }
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
          setStep(0);
          setCaptchaToken("");
          reset();
        }}
      />
    );
  }

  const review: [string, string][] = [
    [t("name"), values.name],
    [t("organisation"), values.organisation],
    [t("clientType"), values.clientType ? t(`clientTypes.${values.clientType as (typeof CLIENT_TYPES)[number]}`) : ""],
    [t("email"), values.email],
    [t("phone"), values.phone],
    [t("workType"), values.workType],
    [t("city"), [values.city, values.state].filter(Boolean).join(", ")],
    [t("estimatedValue"), values.estimatedValue],
    [t("deadline"), values.deadline],
    [t("tenderMessage"), values.message],
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
      <StepIndicator steps={steps} current={step} />
      <Honeypot value={values.website} onChange={(value) => set("website", value)} />

      {step === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("name")} error={fieldError("name")}>
            {(props) => (
              <input {...props} className={inputClass} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            )}
          </Field>
          <Field label={t("organisation")} error={fieldError("organisation")}>
            {(props) => (
              <input
                {...props}
                className={inputClass}
                autoComplete="organization"
                value={values.organisation}
                onChange={(e) => set("organisation", e.target.value)}
              />
            )}
          </Field>
          <Field label={t("clientType")} error={fieldError("clientType")} optional className="sm:col-span-2">
            {(props) => (
              <select {...props} className={inputClass} value={values.clientType} onChange={(e) => set("clientType", e.target.value)}>
                <option value="">{t("select")}</option>
                {CLIENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`clientTypes.${type}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t("email")} error={fieldError("email")}>
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
          <Field label={t("phone")} error={fieldError("phone")}>
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
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("workType")} error={fieldError("workType")} className="sm:col-span-2">
            {(props) => (
              <select {...props} className={inputClass} value={values.workType} onChange={(e) => set("workType", e.target.value)}>
                <option value="">{t("select")}</option>
                {workTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value={t("workTypeOther")}>{t("workTypeOther")}</option>
              </select>
            )}
          </Field>
          <Field label={t("city")} error={fieldError("city")}>
            {(props) => <input {...props} className={inputClass} value={values.city} onChange={(e) => set("city", e.target.value)} />}
          </Field>
          <Field label={t("state")} error={fieldError("state")} optional>
            {(props) => <input {...props} className={inputClass} value={values.state} onChange={(e) => set("state", e.target.value)} />}
          </Field>
          <Field label={t("estimatedValue")} error={fieldError("estimatedValue")} optional>
            {(props) => (
              <select
                {...props}
                className={inputClass}
                value={values.estimatedValue}
                onChange={(e) => set("estimatedValue", e.target.value)}
              >
                <option value="">{t("select")}</option>
                {(t.raw("values") as string[]).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t("deadline")} error={fieldError("deadline")} optional>
            {(props) => (
              <input {...props} type="date" className={inputClass} value={values.deadline} onChange={(e) => set("deadline", e.target.value)} />
            )}
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5">
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
          <Field label={t("tenderMessage")} error={fieldError("message")} optional>
            {(props) => (
              <textarea {...props} rows={5} className={inputClass} value={values.message} onChange={(e) => set("message", e.target.value)} />
            )}
          </Field>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-5">
          <dl className="divide-y divide-slate-100 rounded-md border border-slate-200">
            {review.map(([label, value]) => (
              <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="whitespace-pre-wrap break-words text-sm font-medium text-slate-900 sm:col-span-2">
                  {value || <span className="font-normal text-slate-400">{t("notProvided")}</span>}
                </dd>
              </div>
            ))}
            <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-sm text-slate-500">{t("files")}</dt>
              <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                {files.length > 0 ? files.map((file) => file.name).join(", ") : <span className="font-normal text-slate-400">{t("noFiles")}</span>}
              </dd>
            </div>
          </dl>
          <Captcha siteKey={settings.turnstileSiteKey} onToken={setCaptchaToken} />
          <FormError error={state.status === "error" ? state.error : undefined} />
          <p className="text-xs text-slate-500">{t("consent")}</p>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} disabled={submitting} className={buttonClass("outline")}>
            {t("previous")}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={submitting} className={buttonClass(step === lastStep ? "primary" : "dark")}>
          {step < lastStep ? t("next") : submitting ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
