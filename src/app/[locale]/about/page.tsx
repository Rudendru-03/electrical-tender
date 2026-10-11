import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/cards";
import { Card, PageHero, Section, SectionHeading, buttonClass } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ locale, path: "/about", title: t("title"), description: t("intro", { name: siteConfig.name }) });
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const story = t.raw("about.story") as string[];
  const values = t.raw("about.values") as { title: string; text: string }[];
  const strength = t.raw("about.strength") as string[];

  return (
    <>
      <PageHero title={t("about.title")} text={t("about.intro", { name: siteConfig.name })} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">{t("about.storyTitle")}</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-slate-700">
              {story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Link href="/credentials" className={buttonClass("outline", "mt-6")}>
              {t("cta.viewCredentials")}
            </Link>
          </div>
          <Card className="h-fit lg:col-span-2">
            <h2 className="text-lg font-semibold text-brand-900">{t("about.strengthTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {strength.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={t("about.valuesTitle")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Card key={value.title}>
              <p className="text-sm font-semibold text-amber-600">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold text-brand-900">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <CtaBand title={t("home.ctaTitle")} text={t("home.ctaText")} primary={{ href: "/tenders#submit", label: t("cta.sendTender") }} />
    </>
  );
}
