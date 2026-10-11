import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProjects } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { ProjectGrid } from "@/components/ProjectGrid";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMetadata({ locale, path: "/projects", title: t("title"), description: t("intro") });
}

export default async function ProjectsPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const projects = await getProjects();

  return (
    <>
      <PageHero title={t("title")} text={t("intro")} />
      <Section>
        {projects.length > 0 ? (
          <ProjectGrid
            allLabel={t("all")}
            projects={projects.map(({ slug, title, client, sector, location, summary, images }) => ({
              slug,
              title,
              client,
              sector,
              location,
              summary,
              images,
            }))}
          />
        ) : (
          <p className="text-slate-600">{t("empty")}</p>
        )}
      </Section>
    </>
  );
}
