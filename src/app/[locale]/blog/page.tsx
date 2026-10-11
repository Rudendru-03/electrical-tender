import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getBlogPosts } from "@/lib/content";
import { type LocaleParams, pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return pageMetadata({ locale, path: "/blog", title: t("title"), description: t("intro") });
}

export default async function BlogPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, format, posts] = await Promise.all([getTranslations(), getFormatter(), getBlogPosts()]);

  return (
    <>
      <PageHero title={t("blog.title")} text={t("blog.intro")} />
      <Section>
        {posts.length === 0 ? <p className="text-slate-600">{t("blog.empty")}</p> : null}
        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
              <time className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {format.dateTime(post.publishedAt ?? post.createdAt, { dateStyle: "medium", timeZone: siteConfig.admin.timeZone })}
              </time>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-brand-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-brand-600">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
                {t("cta.readMore")}
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
