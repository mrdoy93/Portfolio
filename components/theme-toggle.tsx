"use client";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("portfolio-theme", nextTheme);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle light and night mode">
      <span className="theme-toggle-sun" aria-hidden="true">☀</span>
      <span className="theme-toggle-moon" aria-hidden="true">☾</span>
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  );
}