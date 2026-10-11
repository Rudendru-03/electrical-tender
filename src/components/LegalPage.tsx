import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Container, PageHero } from "@/components/ui";

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = await getTranslations("legal");
  const sections = t.raw(kind) as { title: string; text: string }[];

  return (
    <>
      <PageHero title={t(`${kind}Title`)} text={siteConfig.legalName} />
      <Container className="max-w-3xl py-12">
        {/* Shown only outside production so the template is not published unreviewed by accident. */}
        {process.env.NODE_ENV !== "production" ? (
          <p className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("notice")}</p>
        ) : null}
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-brand-900">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-700">{section.text}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
