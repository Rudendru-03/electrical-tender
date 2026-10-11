import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getServices } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CtaBand, ServiceCard } from "@/components/cards";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return pageMetadata({ locale, path: "/services", title: t("title"), description: t("intro") });
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const services = await getServices();

  return (
    <>
      <PageHero title={t("services.title")} text={t("services.intro")} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} cta={t("cta.learnMore")} />
          ))}
        </div>
      </Section>
      <CtaBand title={t("services.ctaTitle")} text={t("services.ctaText")} primary={{ href: "/quote", label: t("cta.getQuote") }} />
    </>
  );
}
