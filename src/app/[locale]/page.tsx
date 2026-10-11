import { ArrowRight, BadgeCheck, FileCheck2, HardHat, Quote, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SECTORS } from "@/config/sectors";
import { siteConfig, telHref, whatsappHref } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getCredentials, getFeaturedProjects, getServices, getTestimonials } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CtaBand, ProjectCard, ServiceCard } from "@/components/cards";
import { ServiceIcon, WhatsAppIcon } from "@/components/icons";
import { TrackedLink } from "@/components/TrackedLink";
import { Container, Section, SectionHeading, buttonClass } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/",
    title: `${siteConfig.name} | ${t("titleSuffix")}`,
    description: t("description", { name: siteConfig.name }),
    absoluteTitle: true,
  });
}

const WHY_ICONS = [BadgeCheck, FileCheck2, HardHat, UserCheck];

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [services, projects, credentials, testimonials] = await Promise.all([
    getServices(),
    getFeaturedProjects(3),
    getCredentials(),
    getTestimonials(),
  ]);
  const { channels, contact, stats } = siteConfig;
  const statItems = (["years", "projects", "clients", "capacity"] as const)
    .map((key) => ({ key, value: stats[key] }))
    .filter((item) => item.value);
  const why = t.raw("home.why") as { title: string; text: string }[];

  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            {t("home.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t("home.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-200">{t("home.text")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tenders#submit" className={buttonClass("primary")}>
              {t("cta.sendTender")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/quote" className={buttonClass("ghost")}>
              {t("cta.getQuote")}
            </Link>
            {channels.whatsapp ? (
              <TrackedLink
                href={whatsappHref(t("whatsapp.general", { name: siteConfig.name }))}
                event="click_whatsapp"
                eventLabel="hero"
                className={buttonClass("ghost")}
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("cta.whatsapp")}
              </TrackedLink>
            ) : null}
            {channels.call ? (
              <TrackedLink href={telHref(contact.phone)} event="click_call" eventLabel="hero" className={buttonClass("ghost", "sm:hidden")}>
                {t("cta.callNow")}
              </TrackedLink>
            ) : null}
          </div>
        </Container>
        {statItems.length > 0 ? (
          <div className="border-t border-white/10 bg-brand-950/40">
            <Container>
              <dl className="grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
                {statItems.map((item) => (
                  <div key={item.key}>
                    <dd className="text-3xl font-semibold text-amber-300">{item.value}</dd>
                    <dt className="mt-1 text-sm text-brand-200">{t(`home.stats.${item.key}`)}</dt>
                  </div>
                ))}
              </dl>
            </Container>
          </div>
        ) : null}
      </section>

      <Section>
        <SectionHeading
          title={t("home.servicesTitle")}
          text={t("home.servicesText")}
          action={
            <Link href="/services" className="text-sm font-semibold text-brand-600 hover:underline">
              {t("cta.viewAll")}
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <ServiceCard key={service.slug} service={service} cta={t("cta.learnMore")} />
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={t("home.sectorsTitle")} text={t("home.sectorsText")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => (
            <Link
              key={sector.slug}
              href={`/sectors/${sector.slug}`}
              className="group flex flex-col rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-brand-300"
            >
              <ServiceIcon name={sector.icon} className="h-7 w-7 text-amber-500" />
              <h3 className="mt-4 text-lg font-semibold text-brand-900">{t(`sectors.items.${sector.key}.title`)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{t(`sectors.items.${sector.key}.summary`)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                {t("cta.learnMore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {projects.length > 0 ? (
        <Section>
          <SectionHeading
            title={t("home.projectsTitle")}
            text={t("home.projectsText")}
            action={
              <Link href="/projects" className="text-sm font-semibold text-brand-600 hover:underline">
                {t("cta.viewAll")}
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="dark">
        <SectionHeading title={t("home.whyTitle")} dark />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((item, index) => {
            const Icon = WHY_ICONS[index % WHY_ICONS.length];
            return (
              <div key={item.title}>
                <Icon className="h-7 w-7 text-amber-300" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-200">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {credentials.length > 0 ? (
        <Section>
          <SectionHeading
            title={t("home.credentialsTitle")}
            text={t("home.credentialsText")}
            action={
              <Link href="/credentials" className="text-sm font-semibold text-brand-600 hover:underline">
                {t("cta.viewCredentials")}
              </Link>
            }
          />
          <ul className="flex flex-wrap gap-3">
            {credentials.map((credential) => (
              <li
                key={credential.id}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                {credential.title}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {testimonials.length > 0 ? (
        <Section tone="muted">
          <SectionHeading title={t("home.testimonialsTitle")} />
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((item) => (
              <figure key={item.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
                <Quote className="h-6 w-6 text-amber-400" aria-hidden />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{item.quote}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-brand-900">{item.name}</span>
                  <span className="block text-slate-500">{[item.designation, item.organisation].filter(Boolean).join(", ")}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand
        title={t("home.ctaTitle")}
        text={t("home.ctaText")}
        primary={{ href: "/tenders#submit", label: t("cta.sendTender") }}
        secondary={
          <Link href="/quote#site-visit" className={buttonClass("ghost")}>
            {t("cta.bookVisit")}
          </Link>
        }
      />
    </>
  );
}
