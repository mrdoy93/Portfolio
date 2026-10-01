import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Arrow } from "@/components/icons";
import { getProject } from "@/lib/projects";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { const project = await getProject((await params).slug); if (!project) notFound(); return <main className="shell"><SiteHeader /><article className="project-page"><Link href="/work" className="back-link">← All work</Link><div className="project-intro"><p className="eyebrow">{project.kind} <i /> {project.year}</p><h1>{project.title}</h1><p>{project.description}</p></div><div className="project-frame">{project.video_embed_url ? <iframe src={project.video_embed_url} title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="technical-screen"><span>RJC / SYSTEM</span><strong>Signal, not noise.</strong><i /></div>}</div><div className="project-details"><div><span>Client</span><p>{project.client || "Personal project"}</p></div><div><span>Role</span><p>{project.role}</p></div><div><span>Deliverables</span><p>{project.deliverables.join(" · ")}</p></div><div><span>Tools</span><p>{project.tools.join(" · ")}</p></div></div><Link className="button" href="/contact">Let&apos;s make something <Arrow /></Link></article></main>; }

