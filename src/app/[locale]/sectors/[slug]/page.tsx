import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SECTORS } from "@/config/sectors";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getServices } from "@/lib/content";
import { type SlugParams, pageMetadata } from "@/lib/seo";
import { ServiceCard } from "@/components/cards";
import { PageHero, Section, SectionHeading, buttonClass } from "@/components/ui";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SECTORS.map((sector) => ({ locale, slug: sector.slug })));
}

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const sector = SECTORS.find((item) => item.slug === slug);
  if (!sector) return {};
  const t = await getTranslations({ locale, namespace: `sectors.items.${sector.key}` });
  return pageMetadata({ locale, path: `/sectors/${slug}`, title: t("title"), description: t("summary") });
}

// The primary action differs by client type: tender form, site visit or callback.
const CTA = {
  tender: { href: "/tenders#submit", label: "sendTender" },
  visit: { href: "/quote#site-visit", label: "bookVisit" },
  callback: { href: "/quote#callback", label: "requestCallback" },
} as const;

export default async function SectorPage({ params }: SlugParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sector = SECTORS.find((item) => item.slug === slug);
  if (!sector) notFound();
  const [t, services] = await Promise.all([getTranslations(), getServices()]);
  const base = `sectors.items.${sector.key}` as const;
  const points = t.raw(`${base}.points`) as string[];
  const cta = CTA[sector.cta];

  return (
    <>
      <PageHero title={t(`${base}.title`)} text={t(`${base}.summary`)}>
        <Link href={cta.href} className={buttonClass("primary")}>
          {t(`cta.${cta.label}`)}
        </Link>
        {sector.key === "government" ? (
          <Link href="/credentials" className={buttonClass("ghost")}>
            {t("cta.viewCredentials")}
          </Link>
        ) : (
          <Link href="/quote" className={buttonClass("ghost")}>
            {t("cta.getQuote")}
          </Link>
        )}
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <p className="text-lg leading-relaxed text-slate-700">{t(`${base}.intro`)}</p>
          <div>
            <h2 className="text-xl font-semibold text-brand-900">{t("sectors.offerTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 text-slate-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={t("home.servicesTitle")} text={t("home.servicesText")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <ServiceCard key={service.slug} service={service} cta={t("cta.learnMore")} />
          ))}
        </div>
      </Section>
    </>
  );
}
