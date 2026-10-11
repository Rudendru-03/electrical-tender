import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

/** Path with its locale prefix, e.g. ("hi", "/about") -> "/hi/about". */
export function localizedPath(locale: string, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const languages = Object.fromEntries(routing.locales.map((item) => [item, localizedPath(item, path)]));
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localizedPath(locale, path),
      languages: { ...languages, "x-default": localizedPath(routing.defaultLocale, path) },
    },
    openGraph: {
      title,
      description,
      url: localizedPath(locale, path),
      siteName: siteConfig.name,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      type: "website",
    },
  };
}

export type LocaleParams = { params: Promise<{ locale: string }> };
export type SlugParams = { params: Promise<{ locale: string; slug: string }> };
