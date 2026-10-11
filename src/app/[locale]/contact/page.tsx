import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { getFormSettings, siteConfig, telHref, whatsappHref } from "@/config/site";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { QuickForm } from "@/components/forms/QuickForm";
import { WhatsAppIcon } from "@/components/icons";
import { ListingLinks, SocialLinks, activeListings, activeSocial } from "@/components/SocialLinks";
import { TrackedLink } from "@/components/TrackedLink";
import { PageHero, Section, SectionHeading } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("title"), description: t("intro") });
}

function Channel({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">{icon}</span>
      <div className="min-w-0 text-sm">
        <p className="text-slate-500">{label}</p>
        <div className="mt-0.5 break-words font-medium text-brand-900">{children}</div>
      </div>
    </li>
  );
}

export default async function ContactPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { contact, channels } = siteConfig;
  const linkClass = "hover:text-brand-600 hover:underline";
  const emails = [
    { label: t("contact.salesEmail"), value: contact.emails.sales },
    { label: t("contact.tendersEmail"), value: contact.emails.tenders },
    { label: t("contact.careersEmail"), value: contact.emails.careers },
  ].filter((item) => item.value);

  return (
    <>
      <PageHero title={t("contact.title")} text={t("contact.intro")} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ul className="space-y-3">
              {channels.call ? (
                <Channel icon={<Phone className="h-5 w-5" aria-hidden />} label={t("contact.call")}>
                  <TrackedLink href={telHref(contact.phone)} event="click_call" eventLabel="contact" className={linkClass}>
                    {contact.phone}
                  </TrackedLink>
                  {contact.phoneAlt ? (
                    <TrackedLink href={telHref(contact.phoneAlt)} event="click_call" eventLabel="contact_alt" className={`block ${linkClass}`}>
                      {contact.phoneAlt}
                    </TrackedLink>
                  ) : null}
                </Channel>
              ) : null}
              {channels.whatsapp ? (
                <Channel icon={<WhatsAppIcon className="h-5 w-5" />} label={t("contact.whatsapp")}>
                  <TrackedLink
                    href={whatsappHref(t("whatsapp.general", { name: siteConfig.name }))}
                    event="click_whatsapp"
                    eventLabel="contact"
                    className={linkClass}
                  >
                    {t("contact.whatsappText")}
                  </TrackedLink>
                </Channel>
              ) : null}
              {emails.map((email) => (
                <Channel key={email.label} icon={<Mail className="h-5 w-5" aria-hidden />} label={email.label}>
                  <TrackedLink href={`mailto:${email.value}`} event="click_email" eventLabel="contact" className={linkClass}>
                    {email.value}
                  </TrackedLink>
                </Channel>
              ))}
              {contact.address ? (
                <Channel icon={<MapPin className="h-5 w-5" aria-hidden />} label={t("contact.address")}>
                  {contact.address}
                </Channel>
              ) : null}
              {contact.hours ? (
                <Channel icon={<Clock className="h-5 w-5" aria-hidden />} label={t("contact.hours")}>
                  {contact.hours}
                </Channel>
              ) : null}
            </ul>

            {activeSocial().length > 0 ? (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-brand-900">{t("contact.social")}</h2>
                <SocialLinks className="mt-3" itemClassName="border border-slate-200 text-brand-800 hover:bg-brand-50" />
              </div>
            ) : null}
            {activeListings().length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-brand-900">{t("contact.listings")}</h2>
                <ListingLinks className="mt-3" itemClassName="text-sm font-medium text-brand-600 hover:underline" />
              </div>
            ) : null}
          </div>

          <div id="message" className="lg:col-span-3">
            <SectionHeading title={t("contact.formTitle")} />
            <QuickForm type="CONTACT" settings={getFormSettings()} siteName={siteConfig.name} />
          </div>
        </div>
      </Section>

      {contact.mapEmbedUrl ? (
        <iframe
          src={contact.mapEmbedUrl}
          title={t("contact.address")}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-96 w-full border-0"
        />
      ) : null}
    </>
  );
}
