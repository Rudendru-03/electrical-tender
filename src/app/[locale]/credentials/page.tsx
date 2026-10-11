import { BadgeCheck, FileText } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { getCredentials } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/cards";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "credentials" });
  return pageMetadata({ locale, path: "/credentials", title: t("title"), description: t("intro", { name: siteConfig.name }) });
}

export default async function CredentialsPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, format, credentials] = await Promise.all([getTranslations(), getFormatter(), getCredentials()]);

  // Group by category, keeping the admin-defined order.
  const groups = new Map<string, typeof credentials>();
  for (const credential of credentials) {
    groups.set(credential.category, [...(groups.get(credential.category) ?? []), credential]);
  }

  return (
    <>
      <PageHero title={t("credentials.title")} text={t("credentials.intro", { name: siteConfig.name })} />
      <Section>
        {credentials.length === 0 ? <p className="text-slate-600">{t("credentials.empty")}</p> : null}
        <div className="space-y-12">
          {Array.from(groups, ([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-brand-900">{category}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((credential) => (
                  <li key={credential.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
                    <BadgeCheck className="h-6 w-6 text-emerald-600" aria-hidden />
                    <h3 className="mt-3 font-semibold text-brand-900">{credential.title}</h3>
                    <dl className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
                      {credential.number ? (
                        <div className="flex gap-1.5">
                          <dt>{t("credentials.number")}</dt>
                          <dd className="font-medium text-slate-900">{credential.number}</dd>
                        </div>
                      ) : null}
                      {credential.issuer ? (
                        <div className="flex gap-1.5">
                          <dt>{t("credentials.issuer")}:</dt>
                          <dd className="font-medium text-slate-900">{credential.issuer}</dd>
                        </div>
                      ) : null}
                      {credential.validTill ? (
                        <div className="flex gap-1.5">
                          <dt>{t("credentials.validTill")}:</dt>
                          <dd className="font-medium text-slate-900">
                            {format.dateTime(credential.validTill, { dateStyle: "medium", timeZone: siteConfig.admin.timeZone })}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    {credential.document ? (
                      <a
                        href={mediaUrl(credential.document)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" aria-hidden />
                        {t("credentials.view")}
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-slate-500">{t("credentials.onRequest")}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand
        title={t("credentials.requestTitle")}
        text={t("credentials.requestText")}
        primary={{ href: "/contact#message", label: t("cta.contactUs") }}
      />
    </>
  );
}
