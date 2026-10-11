import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFormSettings, siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { QuoteTabs } from "@/components/forms/QuoteTabs";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  return pageMetadata({ locale, path: "/quote", title: t("title"), description: t("intro") });
}

export default async function QuotePage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, services] = await Promise.all([getTranslations("quote"), getServices()]);

  return (
    <>
      <PageHero title={t("title")} text={t("intro")} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <QuoteTabs settings={getFormSettings()} workTypes={services.map((service) => service.title)} siteName={siteConfig.name} />
          <p className="mt-6 text-sm text-slate-600">
            {t("tenderHint")}{" "}
            <Link href="/tenders#submit" className="font-semibold text-brand-600 hover:underline">
              {t("tenderLink")}
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
