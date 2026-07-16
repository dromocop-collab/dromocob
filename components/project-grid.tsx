"use client";

import Image from "next/image";
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
          <div className="project-visual">
            {project.coverUrl ? <Image src={project.coverUrl} alt={project.title} width={1200} height={800} unoptimized /> : <div className={`visual-seed seed-${(index % 3) + 1}`} />}
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="project-meta">
            <div><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><p>{project.summary}</p></div>
            <ArrowUpRight />
          </div>
        </article>
      ))}
    </div>
  );
}
