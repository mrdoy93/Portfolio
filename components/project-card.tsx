import Link from "next/link";
import { Arrow, Play } from "@/components/icons";
import type { Project } from "@/lib/types";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return <Link className={`project-card project-card-${project.kind.toLowerCase().replace(" ", "-")}`} href={`/work/${project.slug}`}>
    <div className="project-visual">
      {project.thumbnail_url ? <img src={project.thumbnail_url} alt="" /> : <div className="visual-art"><span>{project.kind === "Technical" ? "01 / 01" : project.client?.slice(0, 1) || "R"}</span><i /></div>}
      {project.video_embed_url && <span className="play"><Play /></span>}
      {priority && <span className="featured-label">Featured</span>}
    </div>
    <div className="project-meta"><span>{project.kind} <b>·</b> {project.year}</span><Arrow /></div>
    <h3>{project.title}</h3><p>{project.excerpt}</p>
  </Link>;
}

