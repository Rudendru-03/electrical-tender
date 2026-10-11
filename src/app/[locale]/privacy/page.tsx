import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({ locale, path: "/privacy", title: t("privacyTitle") });
}

export default async function Page({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage kind="privacy" />;
}
