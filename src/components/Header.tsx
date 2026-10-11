import { Clock, Mail, Phone, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MAIN_NAV } from "@/config/nav";
import { siteConfig, telHref } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { TrackedLink } from "@/components/TrackedLink";
import { Container, buttonClass } from "@/components/ui";

export async function Header() {
  const t = await getTranslations();
  const { contact, channels } = siteConfig;
  const items = MAIN_NAV.map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }));
  const cta = { href: "/tenders#submit", label: t("cta.sendTender") };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-950 text-brand-200">
        <Container className="flex h-9 items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-5 overflow-hidden">
            {contact.emails.sales ? (
              <TrackedLink
                href={`mailto:${contact.emails.sales}`}
                event="click_email"
                eventLabel="header"
                className="hidden items-center gap-1.5 hover:text-white sm:flex"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {contact.emails.sales}
              </TrackedLink>
            ) : null}
            {contact.hours ? (
              <span className="flex items-center gap-1.5 truncate">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {contact.hours}
              </span>
            ) : null}
          </div>
          <LocaleSwitcher label={t("nav.language")} />
        </Container>
      </div>
      <div className="relative border-b border-slate-200 bg-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-brand-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-brand-950">
              <Zap className="h-5 w-5" aria-hidden />
            </span>
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-700 hover:text-brand-600">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {channels.call ? (
              <TrackedLink
                href={telHref(contact.phone)}
                event="click_call"
                eventLabel="header"
                aria-label={`${t("cta.callNow")}: ${contact.phone}`}
                className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
              >
                <Phone className="h-4 w-4" aria-hidden />
                <span className="hidden xl:inline">{contact.phone}</span>
              </TrackedLink>
            ) : null}
            {/* On small screens the same CTA lives inside the menu. */}
            <div className="hidden lg:block">
              <Link href={cta.href} className={buttonClass("primary", "h-10 py-0")}>
                {cta.label}
              </Link>
            </div>
            <MobileMenu items={items} cta={cta} openLabel={t("nav.openMenu")} closeLabel={t("nav.closeMenu")} />
          </div>
        </Container>
      </div>
    </header>
  );
}
