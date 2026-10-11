import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/** Read helpers for public pages. Wrapped in `cache` so a page render queries each list once. */

export const getServices = cache(() =>
  prisma.service.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
);

export const getService = cache((slug: string) => prisma.service.findFirst({ where: { slug, published: true } }));

export const getProjects = cache(() =>
  prisma.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { year: "desc" }, { createdAt: "desc" }],
  }),
);

export const getFeaturedProjects = cache(async (limit: number) => {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
});

export const getProject = cache((slug: string) => prisma.project.findFirst({ where: { slug, published: true } }));

export const getTestimonials = cache(() =>
  prisma.testimonial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
);

export const getCredentials = cache(() =>
  prisma.credential.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
);

export const getBlogPosts = cache(() =>
  prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, excerpt: true, cover: true, publishedAt: true, createdAt: true, updatedAt: true },
  }),
);

export const getBlogPost = cache((slug: string) => prisma.blogPost.findFirst({ where: { slug, published: true } }));

export const getJobOpenings = cache(() =>
  prisma.jobOpening.findMany({ where: { open: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
);
