import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { removePortrait, savePortrait, saveProject, signOut } from "./actions";
import { DeleteProjectButton } from "./delete-project-button";

type FieldProps = {
  name: string;
  label: string;
  required?: boolean;
  value?: string;
  type?: string;
  placeholder?: string;
};

function Field({
  name,
  label,
  required = false,
  value = "",
  type = "text",
  placeholder,
}: FieldProps) {
  return (
    <label className="admin-field">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value}
        placeholder={placeholder}
      />
    </label>
  );
}

function ProjectForm({ project }: { project?: Project }) {
  return (
    <form action={saveProject} className="admin-form">
      <input type="hidden" name="id" value={project?.id || ""} />
      <div className="form-grid">
        <Field
          name="title"
          label="Project title"
          required
          value={project?.title}
          placeholder="Campaign or project name"
        />
        <Field
          name="slug"
          label="URL slug"
          value={project?.slug}
          placeholder="Created from the title if empty"
        />
        <label className="admin-field">
          Type
          <select name="kind" defaultValue={project?.kind || "UGC Video"}>
            <option>UGC Video</option>
            <option>Technical</option>
            <option>Creative</option>
          </select>
        </label>
        <Field
          name="year"
          label="Year"
          required
          value={project?.year}
          placeholder={String(new Date().getFullYear())}
        />
        <Field name="client" label="Client" value={project?.client || ""} placeholder="Optional" />
        <Field name="role" label="Your role" required value={project?.role} placeholder="Creative direction" />
      </div>
      <Field
        name="excerpt"
        label="Short description"
        required
        value={project?.excerpt}
        placeholder="A short summary for project cards"
      />
      <label className="admin-field">
        Full description
        <textarea
          name="description"
          required
          defaultValue={project?.description}
          rows={5}
          placeholder="Tell the story, process, and outcome."
        />
      </label>
      <div className="form-grid">
        <Field
          name="deliverables"
          label="Deliverables"
          value={project?.deliverables.join(", ")}
          placeholder="Video, strategy, campaign"
        />
        <Field
          name="tools"
          label="Tools"
          value={project?.tools.join(", ")}
          placeholder="Next.js, Supabase, Figma"
        />
        <Field
          name="video_embed_url"
          label="YouTube, Vimeo, or embed URL"
          type="url"
          value={project?.video_embed_url || ""}
          placeholder="Paste a watch, share, Shorts, Vimeo, or embed URL"
        />
        <Field
          name="thumbnail_url"
          label="Thumbnail URL"
          type="url"
          value={project?.thumbnail_url || ""}
          placeholder="https://..."
        />
      </div>
      <div className="admin-form-footer">
        <div className="check-row">
          <label>
            <input name="featured" type="checkbox" defaultChecked={project?.featured} />
            Feature on home
          </label>
          <label>
            <input name="published" type="checkbox" defaultChecked={project?.published} />
            Publish publicly
          </label>
        </div>
        <button className="admin-primary-button">
          {project ? "Save changes" : "Create project"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function NavIcon({ children }: { children: string }) {
  return <span className="admin-nav-icon" aria-hidden="true">{children}</span>;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="admin-page setup-note">
        <p className="eyebrow">CMS setup required</p>
        <h1>Connect Supabase<br />to unlock your studio.</h1>
        <p>
          Add the two public environment variables from <code>.env.example</code>, run <code>supabase/schema.sql</code> in your Supabase SQL editor, then create your administrator account and grant it the <code>admin</code> role as noted in the setup guide.
        </p>
        <Link href="/">Back to portfolio</Link>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    redirect("/login?error=This+account+does+not+have+admin+access.+Grant+it+the+admin+role+in+Supabase.");
  }

  const { data, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data || []) as Project[];
  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("portrait_url")
    .eq("id", "site")
    .maybeSingle();
  const { error: actionError, edit } = await searchParams;
  const error = actionError || projectsError?.message || settingsError?.message;
  const projectToEdit = edit ? projects.find((project) => project.id === edit) : undefined;
  const publishedCount = projects.filter((project) => project.published).length;
  const draftCount = projects.length - publishedCount;
  const featuredCount = projects.filter((project) => project.featured).length;
  const displayName = user.email?.split("@")[0] || "Admin";

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>RJC<span className="admin-brand-dot">.</span></span>
          <small>Portfolio CMS</small>
        </div>

        <nav className="admin-nav" aria-label="Dashboard navigation">
          <p>Workspace</p>
          <a className="active" href="#overview">
            <NavIcon>⌂</NavIcon>
            Overview
          </a>
          <a href="#profile">
            <NavIcon>◎</NavIcon>
            Profile photo
          </a>
          <a href="#projects">
            <NavIcon>▦</NavIcon>
            Projects
            <span className="admin-nav-count">{projects.length}</span>
          </a>
          <a className="admin-nav-create" href="#new-project">
            <NavIcon>＋</NavIcon>
            New project
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" target="_blank">
            <NavIcon>↗</NavIcon>
            View portfolio
          </Link>
          <form action={signOut}>
            <button>
              <NavIcon>←</NavIcon>
              Sign out
            </button>
          </form>
          <div className="admin-account">
            <span>{displayName.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{displayName}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-mobile-brand">RJC<span className="admin-brand-dot">.</span></span>
            <p>Portfolio workspace</p>
          </div>
          <Link className="admin-topbar-link" href="/" target="_blank">View live site ↗</Link>
        </header>

        <div className="admin-content">
          {error && <p className="form-error admin-error">{error}</p>}

          <section id="overview" className="admin-overview">
            <div className="admin-page-heading">
              <div>
                <p className="admin-kicker">Dashboard</p>
                <h1>Welcome back, {displayName}.</h1>
                <p>Manage your portfolio and keep your best work up to date.</p>
              </div>
              <a className="admin-primary-button" href="#new-project">
                <span aria-hidden="true">＋</span>
                New project
              </a>
            </div>

            <div className="admin-stats">
              <article>
                <span>Total projects</span>
                <strong>{projects.length}</strong>
                <small>All portfolio entries</small>
              </article>
              <article>
                <span>Published</span>
                <strong>{publishedCount}</strong>
                <small>Visible on your site</small>
              </article>
              <article>
                <span>Drafts</span>
                <strong>{draftCount}</strong>
                <small>Waiting for review</small>
              </article>
              <article>
                <span>Featured</span>
                <strong>{featuredCount}</strong>
                <small>Shown on the homepage</small>
              </article>
            </div>
          </section>

          <section id="profile" className="admin-panel admin-profile-panel">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Identity</p>
                <h2>Profile photo</h2>
                <p>Upload the portrait shown in place of the RJC initials on your home and About pages.</p>
              </div>
            </div>
            <div className="admin-profile-editor">
              <div className="admin-profile-preview">
                {settings?.portrait_url ? <img src={settings.portrait_url} alt="Current profile" /> : <span>RJC</span>}
              </div>
              <div className="admin-profile-controls">
                <form action={savePortrait}>
                  <label className="admin-field">
                    Choose a photo
                    <input name="portrait" type="file" accept="image/jpeg,image/png,image/webp" required />
                  </label>
                  <p>JPG, PNG, or WebP. Maximum 5 MB. A portrait-oriented image works best.</p>
                  <button className="admin-primary-button">{settings?.portrait_url ? "Replace photo" : "Upload photo"}</button>
                </form>
                {settings?.portrait_url && (
                  <form action={removePortrait}>
                    <button className="admin-remove-photo">Remove photo</button>
                  </form>
                )}
              </div>
            </div>
          </section>
          <section id="projects" className="admin-panel admin-projects-panel">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Content</p>
                <h2>Your projects</h2>
              </div>
              <span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
            </div>

            {projects.length === 0 ? (
              <div className="admin-empty">
                <span aria-hidden="true">◇</span>
                <h3>No projects yet</h3>
                <p>Create your first project and publish it when it is ready.</p>
                <a href="#new-project">Create a project →</a>
              </div>
            ) : (
              <div className="admin-project-list">
                {projects.map((project) => (
                  <article key={project.id} className="admin-project-row">
                    <span className={`admin-project-thumb admin-project-thumb-${project.kind.toLowerCase().replace(" ", "-")}`}>
                      {project.thumbnail_url ? <img src={project.thumbnail_url} alt="" /> : project.title.slice(0, 1)}
                    </span>
                    <span className="admin-project-name">
                      <strong>{project.title}</strong>
                      <small>{project.kind} · {project.year}</small>
                    </span>
                    {project.featured && <span className="admin-featured-badge">Featured</span>}
                    <span className={`admin-status ${project.published ? "is-live" : "is-draft"}`}>
                      <i /> {project.published ? "Live" : "Draft"}
                    </span>
                    <div className="admin-project-actions">
                      {project.published && (
                        <Link className="admin-action-button" href={`/work/${project.slug}`} target="_blank">
                          View
                        </Link>
                      )}
                      <Link className="admin-action-button is-edit" href={`/admin?edit=${encodeURIComponent(project.id)}#edit-project`}>
                        Edit
                      </Link>
                      <DeleteProjectButton id={project.id} title={project.title} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {projectToEdit && (
            <section id="edit-project" className="admin-panel admin-edit-project">
              <div className="admin-section-heading">
                <div>
                  <p className="admin-kicker">Update</p>
                  <h2>Edit {projectToEdit.title}</h2>
                  <p>Change any project detail, publication state, or homepage placement.</p>
                </div>
                <Link className="admin-cancel-link" href="/admin#projects">Cancel</Link>
              </div>
              <ProjectForm project={projectToEdit} />
            </section>
          )}

          <section id="new-project" className="admin-panel admin-new-project">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Create</p>
                <h2>New project</h2>
                <p>Add the details now. You can keep it as a draft until it is ready.</p>
              </div>
              <span className="admin-step">01 / Details</span>
            </div>
            <ProjectForm />
          </section>
        </div>
      </div>
    </main>
  );
}
