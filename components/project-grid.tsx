"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fallbackProjects, fetchActiveProjects } from "@/lib/data";
import type { Project } from "@/lib/types";

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  useEffect(() => { fetchActiveProjects().then(setProjects); }, []);

  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <article className="project-card" key={project.id}>
          <Link className="project-visual" href={`/projeler/${project.slug}`} aria-label={`${project.title} proje detayını incele`}>
            {project.coverUrl ? <Image src={project.coverUrl} alt={`${project.title} — ${project.category} proje görseli`} width={1200} height={1500} sizes="(max-width: 760px) 100vw, 33vw" priority={index === 0} /> : <div className={`visual-seed seed-${(index % 3) + 1}`} />}
            <span>{String(index + 1).padStart(2, "0")}</span>
          </Link>
          <div className="project-meta">
            <div><p className="eyebrow">{project.category}</p><h3><Link href={`/projeler/${project.slug}`}>{project.title}</Link></h3><p>{project.summary}</p></div>
            <Link className="project-arrow" href={`/projeler/${project.slug}`} aria-label={`${project.title} detayına git`}><ArrowUpRight /></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
