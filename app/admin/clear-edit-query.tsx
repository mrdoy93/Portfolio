"use client";

import { useEffect } from "react";


const EDIT_NAVIGATION_KEY = "portfolio-admin-edit-project";

export function ClearEditQuery({ projectId }: { projectId: string }) {
  useEffect(() => {
    const requestedProject = window.sessionStorage.getItem(EDIT_NAVIGATION_KEY);

    if (requestedProject && requestedProject !== projectId) {
      window.location.replace("/admin#projects");
      return;
    }

    window.sessionStorage.removeItem(EDIT_NAVIGATION_KEY);

    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    if (url.hash === "#edit-project") url.hash = "";

    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
    const closeEditorOnNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>(".admin-nav a");
      if (!link) return;

      event.preventDefault();
      window.sessionStorage.removeItem(EDIT_NAVIGATION_KEY);

      // Reload a clean admin route so the server-rendered edit panel is removed.
      window.history.replaceState(window.history.state, "", `/admin${link.hash}`);
      window.location.reload();
    };

    document.addEventListener("click", closeEditorOnNavigation);
    return () => document.removeEventListener("click", closeEditorOnNavigation);
  }, [projectId]);

  return null;
}