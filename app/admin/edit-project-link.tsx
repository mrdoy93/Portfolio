"use client";

import Link from "next/link";

const EDIT_NAVIGATION_KEY = "portfolio-admin-edit-project";

export function EditProjectLink({ id }: { id: string }) {
  return (
    <Link
      className="admin-action-button is-edit"
      href={"/admin?edit=" + encodeURIComponent(id) + "#edit-project"}
      onClick={() => window.sessionStorage.setItem(EDIT_NAVIGATION_KEY, id)}
    >
      Edit
    </Link>
  );
}