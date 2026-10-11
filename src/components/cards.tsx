import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { mediaUrl } from "@/lib/media";
import { ServiceIcon } from "@/components/icons";
import { Container, buttonClass } from "@/components/ui";

export function ServiceCard({
  service,
  cta,
}: {
  service: { slug: string; title: string; summary: string; icon: string };
  cta: string;
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-brand-300"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <ServiceIcon name={service.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-brand-900">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{service.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

export function ProjectCover({ image, alt, icon = "zap" }: { image?: string; alt: string; icon?: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-brand-800">
      {image ? (
        <Image src={mediaUrl(image)} alt={alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950 text-brand-300">
          <ServiceIcon name={icon} className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}

export function ProjectCard({
  project,
}: {
  project: { slug: string; title: string; client: string; sector: string; location: string; summary: string; images: string[] };
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-brand-300"
    >
      <ProjectCover image={project.images[0]} alt={project.title} />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{project.sector}</p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-brand-900 group-hover:text-brand-600">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{project.summary}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {project.client} · {project.location}
        </p>
      </div>
    </Link>
  );
}

export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: ReactNode;
}) {
  return (
    <section className="bg-brand-900 text-white">
      <Container className="flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-brand-200">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={primary.href} className={buttonClass("primary")}>
            {primary.label}
          </Link>
          {secondary}
        </div>
      </Container>
    </section>
  );
}
