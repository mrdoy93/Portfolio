"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PROJECT_CATEGORIES, type Project } from "@/lib/types";

type SortOrder = "latest" | "oldest";

function publishedTime(project: Project) {
  if (!project.published_at) return null;
  const time = Date.parse(project.published_at);
  return Number.isNaN(time) ? null : time;
}

export function SortableProjectGallery({ projects }: { projects: Project[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const sortedProjects = useMemo(() => {
    return [...projects].sort((left, right) => {
      const leftTime = publishedTime(left);
      const rightTime = publishedTime(right);
      if (leftTime === null) return rightTime === null ? 0 : 1;
      if (rightTime === null) return -1;
      return sortOrder === "latest" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [projects, sortOrder]);

  return (
    <section className="category-showcase" aria-label="Project thumbnails by category">
      <div className="category-showcase-scroll">
        <div className="category-columns">
          {PROJECT_CATEGORIES.map((category) => {
            const categoryProjects = sortedProjects.filter((project) => project.kind === category);

            return (
              <section key={category} className="category-column" aria-label={`${category} projects`}>
                <div className="category-thumbnail-list">
                  {categoryProjects.length > 0 ? categoryProjects.map((project) => {
                    const thumbnail = project.thumbnail_url || (project.project_media_type?.startsWith("image/") ? project.project_media_url : null);
                    return (
                    <Link key={project.id} className="category-thumbnail" href={`/work/${project.slug}`}>
                      <span className="category-thumbnail-image">
                        {thumbnail ? (
                          <img src={thumbnail} alt="" />
                        ) : (
                          <span aria-hidden="true">{project.title.slice(0, 1)}</span>
                        )}
                      </span>
                      <span className="category-thumbnail-copy">
                        <strong>{project.title}</strong>
                        <small>{project.year}</small>
                      </span>
                    </Link>
                    );
                  }) : (
                    <span className="category-empty">No uploads yet</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <div className="category-showcase-toolbar">
        <Link className="text-link" href="/work">See all work <span>↗</span></Link>
        <div className="project-sort">
          <span>Sort uploads</span>
          <div role="group" aria-label="Sort projects by upload date">
            <button type="button" className={sortOrder === "latest" ? "active" : undefined} aria-pressed={sortOrder === "latest"} onClick={() => setSortOrder("latest")}>Latest</button>
            <button type="button" className={sortOrder === "oldest" ? "active" : undefined} aria-pressed={sortOrder === "oldest"} onClick={() => setSortOrder("oldest")}>Oldest</button>
          </div>
        </div>
      </div>
    </section>
  );
}
