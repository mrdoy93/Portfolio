import { SiteHeader } from "@/components/site-header";
import { ProjectCard } from "@/components/project-card";
import { getPublishedProjects } from "@/lib/projects";

export default async function WorkPage() { const projects = await getPublishedProjects(); return <main className="shell"><SiteHeader /><section className="inner-hero"><p className="eyebrow">Selected work — 2024 / now</p><h1>Work with a<br /><em>point of view.</em></h1><p>A collection of UGC video, digital products, and experimental creative work.</p></section><section className="work-list"><div className="filter-row"><span>All work <b>({projects.length})</b></span><span>UGC video · Technical · Creative</span></div><div className="projects-grid full-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></section></main>; }

