import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SECTORS } from "@/config/sectors";
import { Link } from "@/i18n/navigation";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { ServiceIcon } from "@/components/icons";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata({ locale, path: "/sectors", title: t("sectors.title"), description: t("home.sectorsText") });
}

export default async function SectorsPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t("home.sectorsTitle")} text={t("home.sectorsText")} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2">
          {SECTORS.map((sector) => (
            <Link
              key={sector.slug}
              href={`/sectors/${sector.slug}`}
              className="group flex gap-5 rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-brand-300"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <ServiceIcon name={sector.icon} className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-brand-900">{t(`sectors.items.${sector.key}.title`)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(`sectors.items.${sector.key}.summary`)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  {t("cta.learnMore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
