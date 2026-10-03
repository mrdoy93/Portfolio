import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Arrow } from "@/components/icons";
import { ProtectedProjectMedia } from "@/components/protected-project-media";
import { getProject } from "@/lib/projects";
import { toVideoEmbedUrl } from "@/lib/video";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const videoEmbedUrl = toVideoEmbedUrl(project.video_embed_url);
  const isImageProject = project.project_media_type?.startsWith("image/") === true;

  return (
    <main className="shell">
      <SiteHeader />
      <article className={`project-page${isImageProject ? " project-page-image" : ""}`}>
        <Link href="/work" className="back-link">← All work</Link>
        <div className="project-intro">
          <p className="eyebrow">{project.kind} <i /> {project.year}</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        <div className={`project-frame${isImageProject ? " is-image" : ""}`}>
          {project.project_media_url ? (
            <ProtectedProjectMedia src={project.project_media_url} contentType={project.project_media_type} title={project.title} />
          ) : videoEmbedUrl ? (
            <iframe src={videoEmbedUrl} title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          ) : (
            <div className="technical-screen"><span>RJC / SYSTEM</span><strong>Signal, not noise.</strong><i /></div>
          )}
        </div>
        <div className="project-details">
          <div><span>Client</span><p>{project.client || "Personal project"}</p></div>
          <div><span>Role</span><p>{project.role}</p></div>
          <div><span>Deliverables</span><p>{project.deliverables.join(" · ")}</p></div>
          <div><span>Tools</span><p>{project.tools.join(" · ")}</p></div>
        </div>
        <Link className="button" href="/contact">Let&apos;s make something <Arrow /></Link>
      </article>
    </main>
  );
}
