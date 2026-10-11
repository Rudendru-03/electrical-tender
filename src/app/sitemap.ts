import type { MetadataRoute } from "next";
import { SECTORS } from "@/config/sectors";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getBlogPosts, getProjects, getServices } from "@/lib/content";
import { localizedPath } from "@/lib/seo";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/about", "/services", "/sectors", "/projects", "/credentials", "/clients", "/tenders", "/quote", "/careers", "/blog", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getBlogPosts()]);
  const entries: { path: string; lastModified?: Date }[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...SECTORS.map((sector) => ({ path: `/sectors/${sector.slug}` })),
    ...services.map((service) => ({ path: `/services/${service.slug}`, lastModified: service.updatedAt })),
    ...projects.map((project) => ({ path: `/projects/${project.slug}`, lastModified: project.updatedAt })),
    ...posts.map((post) => ({ path: `/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
  const url = (locale: string, path: string) => `${siteConfig.url}${localizedPath(locale, path)}`;

  return entries.flatMap(({ path, lastModified }) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      lastModified,
      alternates: { languages: Object.fromEntries(routing.locales.map((item) => [item, url(item, path)])) },
    })),
  );
}
