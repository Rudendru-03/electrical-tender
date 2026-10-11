import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { Analytics } from "@/components/Analytics";
import { FloatingContact } from "@/components/FloatingContact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"] });

// Pages are prerendered and refreshed hourly; admin edits revalidate them immediately.
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#0b1f3a" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${siteConfig.name} | ${t("titleSuffix")}`, template: `%s | ${siteConfig.name}` },
    description: t("description", { name: siteConfig.name }),
  };
}

// Only these message namespaces are used by client components.
const CLIENT_NAMESPACES = ["form", "cta", "whatsapp", "quote"] as const;

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]));
  const t = await getTranslations("meta");
  const { contact, social } = siteConfig;

  return (
    <html lang={locale} className={`${geistSans.variable} ${devanagari.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={clientMessages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingContact />
        </NextIntlClientProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Electrician",
            name: siteConfig.name,
            legalName: siteConfig.legalName,
            url: siteConfig.url,
            description: t("description", { name: siteConfig.name }),
            ...(contact.phone ? { telephone: contact.phone } : {}),
            ...(contact.emails.sales ? { email: contact.emails.sales } : {}),
            ...(contact.address ? { address: { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "IN" } } : {}),
            ...(siteConfig.establishedYear ? { foundingDate: siteConfig.establishedYear } : {}),
            sameAs: Object.values(social).filter(Boolean),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
