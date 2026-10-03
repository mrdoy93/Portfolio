import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/site-header";
import { Arrow } from "@/components/icons";
import { SortableProjectGallery } from "@/components/sortable-project-gallery";
import { IntroVideo } from "@/components/intro-video";
import { getPublishedProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/site-settings";
import { PROJECT_CATEGORIES } from "@/lib/types";


export default async function Home() {
  const [projects, settings] = await Promise.all([getPublishedProjects(), getSiteSettings()]);

  return (
    <main>
      <div className="shell">
        <SiteHeader />
        <section className="hero">
          <div className="eyebrow hero-tagline">Hello! I&apos;m -</div>
          <h1 className="hero-name" aria-label="Rodolfo Jr. Cortez">
            <span className="hero-name-line" aria-hidden="true">
              {Array.from("Rodolfo Jr. Cortez").map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="hero-name-letter"
                  style={{
                    "--letter-delay": `${index * 55}ms`,
                    "--glow-delay": `${700 + index * 90}ms`,
                  } as CSSProperties}
                >
                  {letter === " " ? "\u00a0" : letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="hero-copy">I am a Computer Engineering graduate with hands-on experience in programming, software development, and building practical digital solutions. I am also exploring AI-powered content creation, combining technology and creativity to produce innovative advertisements, cinematic videos, and digital projects.</p>
          <div className="hero-actions">
            <Link className="button" href="/work">Explore selected work <Arrow /></Link>
            <Link className="text-link" href="/contact">Start a project <span>↗</span></Link>
          </div>
          <div className="hero-orbit">
            {settings.intro_video_url ? (
              <IntroVideo src={settings.intro_video_url} poster={settings.portrait_url || undefined} />
            ) : (
              <div className="orbit-photo" aria-hidden="true">
                {settings.portrait_url ? <img src={settings.portrait_url} alt="" /> : <span>RJC</span>}
              </div>
            )}
            <p>Available for<br />select projects <b>↘</b></p>
          </div>
        </section>
        <div className="category-table">
          <section className="marquee" aria-label="Project categories">
            {PROJECT_CATEGORIES.map((category) => (
              <Link key={category} href={`/work?category=${encodeURIComponent(category)}`}>
                <span>{category}</span><i aria-hidden="true">✦</i>
              </Link>
            ))}
          </section>
          <SortableProjectGallery projects={projects} />
        </div>
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
