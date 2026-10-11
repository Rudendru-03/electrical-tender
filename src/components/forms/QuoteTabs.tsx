"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { FormSettings } from "@/config/site";
import { cn } from "@/components/ui";
import { QuickForm, type QuickFormType } from "./QuickForm";

const TABS = ["QUOTE", "SITE_VISIT", "CALLBACK"] as const satisfies QuickFormType[];
type Tab = (typeof TABS)[number];

// Lets other pages deep-link to a tab, e.g. /quote#site-visit
const HASHES: Record<string, Tab> = { quote: "QUOTE", "site-visit": "SITE_VISIT", callback: "CALLBACK" };

export function QuoteTabs({ settings, workTypes, siteName }: { settings: FormSettings; workTypes: string[]; siteName: string }) {
  const t = useTranslations("quote.tabs");
  const [active, setActive] = useState<Tab>("QUOTE");

  useEffect(() => {
    const fromHash = () => {
      const tab = HASHES[window.location.hash.slice(1)];
      if (tab) setActive(tab);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              "rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
              active === tab ? "bg-brand-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-brand-50",
            )}
          >
            {t(tab)}
          </button>
        ))}
      </div>
      {/* key remounts the form so each tab keeps its own state and reference number */}
      <QuickForm key={active} type={active} settings={settings} workTypes={workTypes} siteName={siteName} />
    </div>
  );
}
