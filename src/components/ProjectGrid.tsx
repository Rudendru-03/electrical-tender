"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/cards";
import { cn } from "@/components/ui";

type Project = Parameters<typeof ProjectCard>[0]["project"];

export function ProjectGrid({ projects, allLabel }: { projects: Project[]; allLabel: string }) {
  const sectors = Array.from(new Set(projects.map((project) => project.sector))).sort();
  const [sector, setSector] = useState("");
  const shown = sector ? projects.filter((project) => project.sector === sector) : projects;

  return (
    <>
      {sectors.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {["", ...sectors].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={sector === item}
              onClick={() => setSector(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                sector === item ? "bg-brand-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-brand-50",
              )}
            >
              {item || allLabel}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </>
  );
}
