import { SiteHeader } from "@/components/site-header";

const email = "r.jr.cortezrodolfo@gmail.com";

export default function ContactPage() {
  return (
    <main className="shell contact-shell">
      <SiteHeader />
      <section className="contact">
        <div className="contact-hero">
          <div className="contact-intro">
            <p className="eyebrow"><i /> Let&apos;s connect</p>
            <h1>Ideas become<br /><em>real together.</em></h1>
            <p className="contact-lead">
              I&apos;m always open to new opportunities, collaborations, and creative projects. Whether you&apos;d like to discuss technology, programming, AI video production, or potential work opportunities, feel free to get in touch.
            </p>
          </div>

          <div className="contact-signal" aria-hidden="true">
            <div className="contact-orbit">
              <span />
              <i className="contact-detection" />
            </div>
            <p>Open to ideas<br />Philippines <b>↘</b></p>
          </div>
        </div>

        <div className="contact-grid">
          <section className="contact-information" aria-labelledby="contact-information-title">
            <div className="contact-section-title">
              <span>01</span>
              <h2 id="contact-information-title">Contact information</h2>
            </div>

            <div className="contact-list">
              <a href={`mailto:${email}`}>
                <small>Email</small>
                <strong>{email}</strong>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="tel:+639684225214">
                <small>Phone</small>
                <strong>+63 968 422 5214</strong>
                <span aria-hidden="true">↗</span>
              </a>
              <div>
                <small>Location</small>
                <strong>Philippines</strong>
                <span className="contact-status"><i /> Available worldwide</span>
              </div>
            </div>
          </section>

          <aside className="contact-project-card">
            <span className="contact-card-index">02 / PROJECTS</span>
            <span className="contact-card-mark" aria-hidden="true">✦</span>
            <p>Have a project in mind?</p>
            <h2>Let&apos;s turn ideas into something <em>creative</em> and meaningful.</h2>
            <p>Feel free to send me a message—I&apos;d be happy to connect.</p>
            <a className="contact-button" href={`mailto:${email}?subject=Project%20inquiry`}>
              Get in touch <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
