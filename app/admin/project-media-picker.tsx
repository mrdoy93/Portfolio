"use client";

import { useRef, useState } from "react";

type MediaKind = "video" | "image";

type ProjectMediaPickerProps = {
  currentUrl: string | null;
  currentType: string | null;
  title: string;
  mediaKind: MediaKind;
};

export function ProjectMediaPicker({ currentUrl, currentType, title, mediaKind }: ProjectMediaPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const isImage = mediaKind === "image";
  const mediaLabel = isImage ? "image" : "video";

  return (
    <div className="admin-field admin-project-media-field">
      <span>Project {mediaLabel}</span>
      <button
        className="admin-media-window-trigger"
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {currentUrl ? "Replace " + mediaLabel : "Upload " + mediaLabel}
        <span aria-hidden="true">+</span>
      </button>
      <small className="admin-media-upload-status">
        {selectedFile || (currentUrl ? "Current " + mediaLabel + " attached" : "No " + mediaLabel + " selected")}
      </small>

      <dialog ref={dialogRef} className="admin-media-dialog">
        <div className="admin-media-dialog-panel">
          <header>
            <div>
              <span>{isImage ? "Image upload" : "Video upload"}</span>
              <h3>{title}</h3>
            </div>
            <button type="button" aria-label="Close upload window" onClick={() => dialogRef.current?.close()}>&times;</button>
          </header>

          <input type="hidden" name="project_media_kind" value={mediaKind} />

          <label className="admin-media-file-drop">
            <span>{isImage ? "Choose a photo or image" : "Choose a video"}</span>
            <small>{isImage ? "JPG, PNG, or WebP" : "MP4 or WebM"} &middot; Maximum 25 MB</small>
            <input
              name="project_media_file"
              type="file"
              accept={isImage ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm"}
              onChange={(event) => setSelectedFile(event.target.files?.[0]?.name || "")}
            />
          </label>

          {currentUrl && (
            <div className="admin-project-media-preview">
              {currentType?.startsWith("image/") ? (
                <img src={currentUrl} alt={"Current media for " + title} />
              ) : (
                <video src={currentUrl} controls preload="metadata" />
              )}
            </div>
          )}

          {currentUrl && (
            <label className="admin-remove-upload">
              <input name="remove_project_media" type="checkbox" />
              Remove the current uploaded file when saving
            </label>
          )}

          <footer>
            <button type="button" className="admin-primary-button" onClick={() => dialogRef.current?.close()}>
              Use this selection
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}