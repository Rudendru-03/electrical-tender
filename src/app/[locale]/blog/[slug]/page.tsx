import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { type SlugParams, localizedPath, pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/cards";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/ui";

// Prerender known slugs at build; new ones are rendered on first request and then cached.
export async function generateStaticParams() {
  return (await getBlogPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({ locale, path: `/blog/${slug}`, title: post.title, description: post.excerpt });
}

export default async function BlogPostPage({ params }: SlugParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [post, t, format] = await Promise.all([getBlogPost(slug), getTranslations(), getFormatter()]);
  if (!post) notFound();
  const published = post.publishedAt ?? post.createdAt;

  return (
    <>
      <article>
        <div className="bg-brand-900 text-white">
          <Container className="max-w-3xl py-12 sm:py-16">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-brand-200 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t("blog.title")}
            </Link>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-sm text-brand-200">
              {t("blog.publishedOn", {
                date: format.dateTime(published, { dateStyle: "long", timeZone: siteConfig.admin.timeZone }),
              })}
            </p>
          </Container>
        </div>
        <Container className="max-w-3xl py-12">
          {post.cover ? (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
              <Image src={mediaUrl(post.cover)} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
            </div>
          ) : null}
          <div className="prose">
            <Markdown>{post.body}</Markdown>
          </div>
        </Container>
      </article>
      <CtaBand title={t("services.ctaTitle")} text={t("services.ctaText")} primary={{ href: "/quote", label: t("cta.getQuote") }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: published.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          mainEntityOfPage: `${siteConfig.url}${localizedPath(locale, `/blog/${slug}`)}`,
          publisher: { "@type": "Organization", name: siteConfig.name },
        }}
      />
    </>
  );
}
