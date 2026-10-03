"use client";

import { useRef, type RefObject } from "react";
import { PROJECT_CATEGORIES, type ProjectKind } from "@/lib/types";
import { saveProject } from "./actions";

type QuickProjectDialogProps = {
  kind: "video" | "image";
  defaultYear: string;
  dialogRef: RefObject<HTMLDialogElement | null>;
};

function QuickProjectDialog({ kind, defaultYear, dialogRef }: QuickProjectDialogProps) {
  const isImage = kind === "image";
  const defaultCategory: ProjectKind = isImage ? "AI Images" : "AI Videos";

  return (
    <dialog ref={dialogRef} className="admin-media-dialog quick-project-dialog">
      <form action={saveProject} className="quick-project-form">
        <input type="hidden" name="id" value="" />
        <input type="hidden" name="slug" value="" />
        <input type="hidden" name="project_media_kind" value={kind} />
        <input type="hidden" name="role" value="Creator" />
        <input type="hidden" name="published" value="on" />

        <header>
          <div>
            <span>Quick project upload</span>
            <h3>{isImage ? "New image project" : "New video project"}</h3>
            <p>
              {isImage
                ? "Upload an image and add the essential details."
                : "Upload a video file or link a video from YouTube, Vimeo, or another platform."}
            </p>
          </div>
          <button type="button" aria-label="Close project window" onClick={() => dialogRef.current?.close()}>&times;</button>
        </header>

        <div className="quick-project-grid">
          <label className="admin-field">
            Project title
            <input name="title" required placeholder={isImage ? "Image project name" : "Video project name"} />
          </label>
          <label className="admin-field">
            Category
            <select name="kind" defaultValue={defaultCategory}>
              {PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="admin-field">
            Year
            <input name="year" defaultValue={defaultYear} />
          </label>
          <label className="admin-field quick-project-description">
            Short description <small>Optional</small>
            <textarea name="excerpt" rows={3} placeholder="One sentence about this project" />
          </label>
        </div>

        {!isImage && (
          <label className="admin-field quick-project-video-link">
            YouTube, Vimeo, or other video link <small>Optional when uploading a file</small>
            <input
              name="video_embed_url"
              type="url"
              placeholder="https://youtube.com/watch?v=... or another embed URL"
            />
          </label>
        )}

        <label className="admin-media-file-drop quick-project-file">
          <span>{isImage ? "Choose the project image" : "Upload a video file"}</span>
          <small>
            {isImage
              ? "JPG, PNG, or WebP - Maximum 25 MB"
              : "Optional when using a link - MP4 or WebM - Maximum 25 MB"}
          </small>
          <input
            name="project_media_file"
            type="file"
            required={isImage}
            accept={isImage ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm"}
          />
        </label>

        {!isImage && (
          <label className="admin-field quick-project-thumbnail">
            Video thumbnail <small>Optional</small>
            <input name="thumbnail_file" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
        )}

        <footer>
          <button type="button" className="admin-action-button" onClick={() => dialogRef.current?.close()}>Cancel</button>
          <button className="admin-primary-button" type="submit">Create project</button>
        </footer>
      </form>
    </dialog>
  );
}

export function QuickProjectCreator({ defaultYear }: { defaultYear: string }) {
  const videoDialogRef = useRef<HTMLDialogElement>(null);
  const imageDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="quick-project-creator">
      <div className="quick-project-options">
        <button type="button" onClick={() => videoDialogRef.current?.showModal()}>
          <span aria-hidden="true" className="quick-project-icon">VIDEO</span>
          <strong>Add video project</strong>
          <small>Upload a file or paste a video link</small>
        </button>
        <button type="button" onClick={() => imageDialogRef.current?.showModal()}>
          <span aria-hidden="true" className="quick-project-icon">IMAGE</span>
          <strong>Upload image project</strong>
          <small>JPG, PNG, or WebP with minimal details</small>
        </button>
      </div>
      <QuickProjectDialog kind="video" defaultYear={defaultYear} dialogRef={videoDialogRef} />
      <QuickProjectDialog kind="image" defaultYear={defaultYear} dialogRef={imageDialogRef} />
    </div>
  );
}