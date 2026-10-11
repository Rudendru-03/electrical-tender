import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hi"],
  defaultLocale: "en",
  // Every URL carries its locale (/en/..., /hi/...). "as-needed" would hide /en behind a proxy rewrite,
  // which makes Next.js link prefetches for the default locale fail with 404.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
