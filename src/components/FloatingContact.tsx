import { getTranslations } from "next-intl/server";
import { siteConfig, whatsappHref } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { TrackedLink } from "@/components/TrackedLink";

/** Floating WhatsApp click-to-chat button, shown on every public page when the channel is enabled. */
export async function FloatingContact() {
  if (!siteConfig.channels.whatsapp) return null;
  const t = await getTranslations();

  return (
    <TrackedLink
      href={whatsappHref(t("whatsapp.general", { name: siteConfig.name }))}
      event="click_whatsapp"
      eventLabel="floating"
      aria-label={t("cta.whatsapp")}
      className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full bg-emerald-600 px-4 text-white shadow-lg transition-colors hover:bg-emerald-700"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="hidden pr-1 text-sm font-semibold sm:inline">{t("cta.whatsapp")}</span>
    </TrackedLink>
  );
}
