import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getService, getServices } from "@/lib/content";
import { type SlugParams, localizedPath, pageMetadata } from "@/lib/seo";
import { ServiceIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { Card, PageHero, Section, buttonClass } from "@/components/ui";

// Prerender known slugs at build; new ones are rendered on first request and then cached.
export async function generateStaticParams() {
  return (await getServices()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({ locale, path: `/services/${slug}`, title: service.title, description: service.summary });
}

export default async function ServicePage({ params }: SlugParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [service, services, t] = await Promise.all([getService(slug), getServices(), getTranslations()]);
  if (!service) notFound();
  const others = services.filter((item) => item.slug !== slug);

  return (
    <>
      <PageHero title={service.title} text={service.summary}>
        <Link href="/quote" className={buttonClass("primary")}>
          {t("cta.getQuote")}
        </Link>
        <Link href="/tenders#submit" className={buttonClass("ghost")}>
          {t("cta.sendTender")}
        </Link>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.body ? (
              <div className="prose">
                <Markdown>{service.body}</Markdown>
              </div>
            ) : null}
            {service.features.length > 0 ? (
              <div className={service.body ? "mt-10" : ""}>
                <h2 className="text-xl font-semibold text-brand-900">{t("services.includes")}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <aside className="space-y-5">
            <Card className="bg-brand-50">
              <h2 className="text-lg font-semibold text-brand-900">{t("services.ctaTitle")}</h2>
              <p className="mt-2 text-sm text-slate-600">{t("services.ctaText")}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/quote" className={buttonClass("primary")}>
                  {t("cta.getQuote")}
                </Link>
                <Link href="/quote#site-visit" className={buttonClass("outline")}>
                  {t("cta.bookVisit")}
                </Link>
              </div>
            </Card>
            {others.length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold text-brand-900">{t("services.other")}</h2>
                <ul className="mt-3 divide-y divide-slate-100">
                  {others.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/services/${item.slug}`} className="flex items-center gap-2.5 py-2.5 text-sm text-slate-700 hover:text-brand-600">
                        <ServiceIcon name={item.icon} className="h-4 w-4 shrink-0 text-brand-500" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </aside>
        </div>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          url: `${siteConfig.url}${localizedPath(locale, `/services/${slug}`)}`,
          provider: { "@type": "Electrician", name: siteConfig.name, url: siteConfig.url },
        }}
      />
    </>
  );
}
