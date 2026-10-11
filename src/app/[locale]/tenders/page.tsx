import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFormSettings, siteConfig } from "@/config/site";
import { getServices } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { TenderForm } from "@/components/forms/TenderForm";
import { JsonLd } from "@/components/JsonLd";
import { Card, PageHero, Section, SectionHeading, buttonClass } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tenders" });
  return pageMetadata({ locale, path: "/tenders", title: t("title"), description: t("intro") });
}

export default async function TendersPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, services] = await Promise.all([getTranslations(), getServices()]);
  const process = t.raw("tenders.process") as { title: string; text: string }[];
  const faq = t.raw("tenders.faq") as { q: string; a: string }[];
  const { valueRange, regions } = siteConfig.tender;

  return (
    <>
      <PageHero title={t("tenders.title")} text={t("tenders.intro")}>
        <a href="#submit" className={buttonClass("primary")}>
          {t("cta.sendTender")}
        </a>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">{t("tenders.undertakeTitle")}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <li key={service.slug} className="flex gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
          {valueRange || regions.length > 0 ? (
            <Card className="h-fit bg-brand-50">
              <dl className="space-y-5 text-sm">
                {valueRange ? (
                  <div>
                    <dt className="text-slate-500">{t("tenders.valueRange")}</dt>
                    <dd className="mt-1 text-lg font-semibold text-brand-900">{valueRange}</dd>
                  </div>
                ) : null}
                {regions.length > 0 ? (
                  <div>
                    <dt className="text-slate-500">{t("tenders.regions")}</dt>
                    <dd className="mt-1 font-medium text-brand-900">{regions.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ) : null}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={t("tenders.processTitle")} />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, index) => (
            <li key={step.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-brand-950">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-brand-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="submit">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={t("tenders.formTitle")} />
          <TenderForm settings={getFormSettings()} workTypes={services.map((service) => service.title)} siteName={siteConfig.name} />
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={t("tenders.faqTitle")} />
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {faq.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold text-brand-900 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-xl font-normal text-slate-400 transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </>
  );
}
