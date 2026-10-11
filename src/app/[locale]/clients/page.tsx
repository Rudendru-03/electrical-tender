import { Quote } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTestimonials } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/cards";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });
  return pageMetadata({ locale, path: "/clients", title: t("title"), description: t("intro") });
}

export default async function ClientsPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, testimonials] = await Promise.all([getTranslations(), getTestimonials()]);

  return (
    <>
      <PageHero title={t("clients.title")} text={t("clients.intro")} />
      <Section>
        {testimonials.length === 0 ? <p className="text-slate-600">{t("clients.empty")}</p> : null}
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
              <Quote className="h-6 w-6 text-amber-400" aria-hidden />
              <blockquote className="mt-3 flex-1 leading-relaxed text-slate-700">{item.quote}</blockquote>
              <figcaption className="mt-5 flex items-center gap-4 text-sm">
                {item.logo ? (
                  <span className="relative h-12 w-20 shrink-0">
                    <Image src={mediaUrl(item.logo)} alt={item.organisation} fill sizes="80px" className="object-contain" />
                  </span>
                ) : null}
                <span>
                  <span className="font-semibold text-brand-900">{item.name}</span>
                  <span className="block text-slate-500">{[item.designation, item.organisation].filter(Boolean).join(", ")}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <CtaBand title={t("home.ctaTitle")} text={t("home.ctaText")} primary={{ href: "/tenders#submit", label: t("cta.sendTender") }} />
    </>
  );
}
