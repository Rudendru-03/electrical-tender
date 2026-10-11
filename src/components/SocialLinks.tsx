import { siteConfig } from "@/config/site";
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons";
import { TrackedLink } from "@/components/TrackedLink";
import { cn } from "@/components/ui";

const SOCIAL = [
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon },
] as const;

const LISTINGS = [
  { key: "googleBusiness", label: "Google Business" },
  { key: "indiamart", label: "IndiaMART" },
  { key: "tradeindia", label: "TradeIndia" },
  { key: "justdial", label: "Justdial" },
] as const;

export function activeSocial() {
  return SOCIAL.filter((item) => siteConfig.social[item.key]).map((item) => ({ ...item, href: siteConfig.social[item.key] }));
}

export function activeListings() {
  return LISTINGS.filter((item) => siteConfig.listings[item.key]).map((item) => ({
    ...item,
    href: siteConfig.listings[item.key],
  }));
}

export function SocialLinks({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const items = activeSocial();
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <TrackedLink
            href={href}
            event="click_social"
            eventLabel={key}
            aria-label={label}
            className={cn("flex h-10 w-10 items-center justify-center rounded-md", itemClassName)}
          >
            <Icon className="h-4.5 w-4.5" />
          </TrackedLink>
        </li>
      ))}
    </ul>
  );
}

export function ListingLinks({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const items = activeListings();
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2", className)}>
      {items.map(({ key, label, href }) => (
        <li key={key}>
          <TrackedLink href={href} event="click_listing" eventLabel={key} className={itemClassName}>
            {label}
          </TrackedLink>
        </li>
      ))}
    </ul>
  );
}
