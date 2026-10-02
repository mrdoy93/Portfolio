import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Arrow } from "@/components/icons";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main className="shell">
      <SiteHeader />
      <section className="about">
        <p className="eyebrow">About Rodolfo</p>
        <h1>Curious by nature.<br /><em>Deliberate</em> by design.</h1>
        <div className="about-grid">
          <div className="portrait-placeholder">
            {settings.portrait_url ? <img src={settings.portrait_url} alt="Rodolfo Jr. Cortez" /> : <span>RJC</span>}
          </div>
          <div>
            <p>I&apos;m Rodolfo Jr. Cortez, a creator and builder working at the intersection of compelling content and useful technology.</p>
            <p>Whether I&apos;m making UGC that earns a pause in the feed or shaping a digital product, I care about the same thing: making the message feel human.</p>
            <Link className="button" href="/contact">Work with me <Arrow /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
