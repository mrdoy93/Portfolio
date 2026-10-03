import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [["Work", "/work"], ["About", "/about"], ["Contact", "/contact"]];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">RC<span>°</span></Link>
      <nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="site-header-actions">
        <ThemeToggle />
        <Link className="header-cta" href="/contact">Let&apos;s talk <span>↗</span></Link>
      </div>
    </header>
  );
}