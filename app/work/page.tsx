import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ProjectCard } from "@/components/project-card";
import { getPublishedProjects } from "@/lib/projects";
import { PROJECT_CATEGORIES, type ProjectKind } from "@/lib/types";

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const projects = await getPublishedProjects();
  const requestedCategory = (await searchParams).category;
  const selectedCategory = PROJECT_CATEGORIES.includes(requestedCategory as ProjectKind)
    ? requestedCategory as ProjectKind
    : null;
  const visibleProjects = selectedCategory
    ? projects.filter((project) => project.kind === selectedCategory)
    : projects;

  return (
    <main className="shell">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">Selected work — 2024 / now</p>
        <h1>Work with a<br /><em>point of view.</em></h1>
        <p>AI videos, AI imagery, product promotions, development projects, and creative hobbies.</p>
      </section>
      <section className="work-list">
        <div className="filter-row">
          <span>{selectedCategory || "All work"} <b>({visibleProjects.length})</b></span>
          <nav className="category-filter" aria-label="Filter projects by category">
            <Link className={!selectedCategory ? "active" : undefined} href="/work">All</Link>
            {PROJECT_CATEGORIES.map((category) => (
              <Link
                key={category}
                className={selectedCategory === category ? "active" : undefined}
                href={`/work?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
        {visibleProjects.length > 0 ? (
          <div className="projects-grid full-grid">
            {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        ) : (
          <p className="empty-projects">No published projects in this category yet.</p>
        )}
      </section>
    </main>
  );
}
