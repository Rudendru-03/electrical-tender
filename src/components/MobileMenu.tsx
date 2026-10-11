"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui";

type Item = { href: string; label: string };

export function MobileMenu({
  items,
  cta,
  openLabel,
  closeLabel,
}: {
  items: Item[];
  cta: Item;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-brand-900"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>
      {open ? (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-t border-slate-200 bg-white shadow-lg">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-base font-medium text-slate-700 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <Link href={cta.href} onClick={() => setOpen(false)} className={buttonClass("primary", "mt-3")}>
              {cta.label}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
