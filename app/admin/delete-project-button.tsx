"use client";

import { deleteProject } from "./actions";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteProject}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="admin-action-button is-delete" type="submit">
        Delete
      </button>
    </form>
  );
}
