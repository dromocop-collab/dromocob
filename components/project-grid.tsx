"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppWindow, ArrowUpRight, Clapperboard, Globe2, LayoutGrid } from "lucide-react";
import { fallbackProjects, fetchActiveProjects } from "@/lib/data";
import type { Project } from "@/lib/types";

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [activeType, setActiveType] = useState<"Tümü" | "Web" | "App" | "Film">("Tümü");
  useEffect(() => { fetchActiveProjects().then(setProjects); }, []);

  const filteredProjects = useMemo(
    () => activeType === "Tümü" ? projects : projects.filter(project => project.projectType === activeType),
    [activeType, projects]
  );

  const filters = [
    { label: "Tümü" as const, icon: LayoutGrid },
    { label: "Web" as const, icon: Globe2 },
    { label: "App" as const, icon: AppWindow },
    { label: "Film" as const, icon: Clapperboard },
  ];

  return (
    <div className="project-showcase">
      <div className="project-filters" role="tablist" aria-label="Proje kategorileri">
        {filters.map(filter => {
          const Icon = filter.icon;
          const count = filter.label === "Tümü" ? projects.length : projects.filter(project => project.projectType === filter.label).length;
          return <button key={filter.label} type="button" role="tab" aria-selected={activeType === filter.label} className={activeType === filter.label ? "is-active" : ""} onClick={() => setActiveType(filter.label)}><Icon/><span>{filter.label}</span><b>{String(count).padStart(2, "0")}</b></button>;
        })}
      </div>
      <div className="project-grid" key={activeType}>
      {filteredProjects.map((project, index) => {
        const href = project.externalUrl || `/projeler/${project.slug}`;
        const external = Boolean(project.externalUrl);
        const visual = <>{project.coverUrl ? <Image src={project.coverUrl} alt={`${project.title} — ${project.category} proje görseli`} width={1200} height={1500} sizes="(max-width: 760px) 100vw, 33vw" priority={index === 0} /> : <div className={`visual-seed seed-${(index % 3) + 1}`}><span className="app-project-monogram">{project.title.split(" ").map(word => word[0]).join("").slice(0, 2)}</span></div>}<span>{String(index + 1).padStart(2, "0")}</span><b className="project-type-stamp">{project.projectType || "Web"}</b></>;
        return (
        <article className={`project-card ${project.projectType === "App" ? "is-app-project" : ""}`} key={project.id}>
          {external ? <a className="project-visual" href={href} target="_blank" rel="noreferrer" aria-label={`${project.title} uygulamasını aç`}>{visual}</a> : <Link className="project-visual" href={href} aria-label={`${project.title} proje detayını incele`}>{visual}</Link>}
          <div className="project-meta">
            <div><p className="eyebrow">{project.projectType} / {project.category}</p><h3>{external ? <a href={href} target="_blank" rel="noreferrer">{project.title}</a> : <Link href={href}>{project.title}</Link>}</h3><p>{project.summary}</p></div>
            {external ? <a className="project-arrow" href={href} target="_blank" rel="noreferrer" aria-label={`${project.title} uygulamasını aç`}><ArrowUpRight /></a> : <Link className="project-arrow" href={href} aria-label={`${project.title} detayına git`}><ArrowUpRight /></Link>}
          </div>
        </article>
      );})}
      </div>
    </div>
  );
}
