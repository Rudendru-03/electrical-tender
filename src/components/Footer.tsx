import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FOOTER_NAV } from "@/config/nav";
import { siteConfig, telHref } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/content";
import { ListingLinks, SocialLinks, activeListings, activeSocial } from "@/components/SocialLinks";
import { TrackedLink } from "@/components/TrackedLink";
import { Container } from "@/components/ui";

export async function Footer() {
  const t = await getTranslations();
  const services = (await getServices()).slice(0, 8);
  const { contact, channels } = siteConfig;
  const linkClass = "text-sm text-brand-200 hover:text-white";

  return (
    <footer className="bg-brand-950 text-brand-200">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{t("footer.summary")}</p>
          {activeSocial().length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-300">{t("footer.follow")}</p>
              <SocialLinks itemClassName="bg-white/10 text-white hover:bg-white/20" />
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("footer.company")}</p>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("footer.services")}</p>
          <ul className="mt-4 space-y-2.5">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} className={linkClass}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("footer.reach")}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {channels.call ? (
              <li>
                <TrackedLink
                  href={telHref(contact.phone)}
                  event="click_call"
                  eventLabel="footer"
                  className="flex items-start gap-2 hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {contact.phone}
                </TrackedLink>
              </li>
            ) : null}
            {contact.emails.sales ? (
              <li>
                <TrackedLink
                  href={`mailto:${contact.emails.sales}`}
                  event="click_email"
                  eventLabel="footer"
                  className="flex items-start gap-2 break-all hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {contact.emails.sales}
                </TrackedLink>
              </li>
            ) : null}
            {contact.address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {contact.address}
              </li>
            ) : null}
          </ul>
          {activeListings().length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-300">{t("footer.listings")}</p>
              <ListingLinks itemClassName={linkClass} />
            </div>
          ) : null}
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-xs">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. {t("footer.rights")}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t("footer.terms")}
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
