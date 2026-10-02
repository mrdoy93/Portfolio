import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Arrow } from "@/components/icons";
import { ProjectCard } from "@/components/project-card";
import { getFeaturedProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const [projects, settings] = await Promise.all([getFeaturedProjects(), getSiteSettings()]);

  return (
    <main>
      <div className="shell">
        <SiteHeader />
        <section className="hero">
          <div className="eyebrow hero-tagline">Stories that <em>move</em> people. <i /></div>
          <h1 className="hero-name" aria-label="Rodolfo Jr. Cortez">
            <span className="hero-name-line" aria-hidden="true"><span className="hero-name-word">Rodolfo</span> <span className="hero-name-word">Jr.</span></span>
            <span className="hero-name-line" aria-hidden="true"><span className="hero-name-word hero-name-accent">Cortez</span></span>
          </h1>
          <p className="hero-copy">I make thumb-stopping UGC and thoughtful digital experiences for brands with something real to say.</p>
          <div className="hero-actions">
            <Link className="button" href="/work">Explore selected work <Arrow /></Link>
            <Link className="text-link" href="/contact">Start a project <span>↗</span></Link>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-photo">
              {settings.portrait_url ? <img src={settings.portrait_url} alt="" /> : <span>RJC</span>}
            </div>
            <p>Available for<br />select projects <b>↘</b></p>
          </div>
        </section>
        <section className="marquee" aria-label="Creative specialties"><span>UGC VIDEO</span><i>✦</i><span>CREATIVE STRATEGY</span><i>✦</i><span>DIGITAL PRODUCTS</span><i>✦</i></section>
        <section className="section work-preview">
          <div className="section-heading">
            <div><p className="eyebrow">01 — Selected work</p><h2>Made to be<br /><em>remembered.</em></h2></div>
            <Link className="text-link" href="/work">See all work <Arrow /></Link>
          </div>
          <div className="projects-grid">{projects.map((project, index) => <ProjectCard key={project.id} project={project} priority={index === 0} />)}</div>
        </section>
        <section className="statement">
          <p className="eyebrow">How I work</p>
          <h2>Equal parts creative instinct <i>and</i> thoughtful execution.</h2>
          <p>I combine the pace of creator content with the care of a product maker—so every project is clear, useful and distinctly yours.</p>
          <Link className="button button-light" href="/about">More about me <Arrow /></Link>
        </section>
        <footer><p>© {new Date().getFullYear()} Rodolfo Jr. Cortez</p><div><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="mailto:hello@example.com">Email</a></div></footer>
      </div>
    </main>
  );
}
