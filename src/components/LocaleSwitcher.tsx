"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/components/ui";

const LABELS: Record<string, string> = { en: "English", hi: "हिन्दी" };

export function LocaleSwitcher({ label }: { label: string }) {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <nav aria-label={label} className="flex items-center gap-1">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium",
            locale === current ? "bg-white/15 text-white" : "text-brand-200 hover:text-white",
          )}
        >
          {LABELS[locale]}
        </Link>
      ))}
    </nav>
  );
}
