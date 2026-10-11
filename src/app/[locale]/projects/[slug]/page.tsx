import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";
import { Link } from "@/i18n/navigation";
import { getProject, getProjects } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { type SlugParams, pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/cards";
import { Card, Container, Section } from "@/components/ui";

// Prerender known slugs at build; new ones are rendered on first request and then cached.
export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({ locale, path: `/projects/${slug}`, title: project.title, description: project.summary });
}

export default async function ProjectPage({ params }: SlugParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [project, t] = await Promise.all([getProject(slug), getTranslations()]);
  if (!project) notFound();

  const facts: [string, string | null][] = [
    [t("projects.client"), project.client],
    [t("projects.sector"), project.sector],
    [t("projects.location"), project.location],
    [t("projects.value"), project.value],
    [t("projects.year"), project.year ? String(project.year) : null],
    [t("projects.duration"), project.duration],
  ];

  return (
    <>
      <div className="bg-brand-900 text-white">
        <Container className="py-12 sm:py-16">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-brand-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("projects.title")}
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-300">{project.sector}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-200">{project.summary}</p>
        </Container>
      </div>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {project.images.length > 0 ? (
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                {project.images.map((image, index) => (
                  <div
                    key={image}
                    className={`relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 ${index === 0 ? "sm:col-span-2" : ""}`}
                  >
                    <Image
                      src={mediaUrl(image)}
                      alt={`${project.title} ${index + 1}`}
                      fill
                      sizes={index === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 640px) 33vw, 100vw"}
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {project.body ? (
              <>
                <h2 className="text-xl font-semibold text-brand-900">{t("projects.scope")}</h2>
                <div className="prose mt-4">
                  <Markdown>{project.body}</Markdown>
                </div>
              </>
            ) : null}
          </div>
          <Card className="h-fit">
            <dl className="divide-y divide-slate-100">
              {facts
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </Card>
        </div>
      </Section>

      <CtaBand title={t("home.ctaTitle")} text={t("home.ctaText")} primary={{ href: "/tenders#submit", label: t("cta.sendTender") }} />
    </>
  );
}
