import { Briefcase, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFormSettings, siteConfig } from "@/config/site";
import { getJobOpenings } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CareerForm } from "@/components/forms/CareerForm";
import { PageHero, Section, SectionHeading } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  return pageMetadata({ locale, path: "/careers", title: t("title"), description: t("intro") });
}

export default async function CareersPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, jobs] = await Promise.all([getTranslations("careers"), getJobOpenings()]);

  return (
    <>
      <PageHero title={t("title")} text={t("intro")} />
      <Section>
        <SectionHeading title={t("openings")} />
        {jobs.length === 0 ? <p className="text-slate-600">{t("empty")}</p> : null}
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-brand-900">{job.title}</h3>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  {job.type}
                </span>
                {job.experience ? (
                  <span>
                    {t("experience")}: {job.experience}
                  </span>
                ) : null}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="muted" id="apply">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={t("applyTitle")} />
          <CareerForm
            settings={getFormSettings()}
            positions={jobs.map((job) => job.title)}
            generalLabel={t("general")}
            siteName={siteConfig.name}
          />
        </div>
      </Section>
    </>
  );
}
