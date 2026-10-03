"use client";

import { useRef, useState } from "react";
import { savePortrait } from "./actions";

export function PortraitUploader({ currentUrl }: { currentUrl: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <form ref={formRef} action={savePortrait} className="admin-portrait-upload">
      <button
        type="button"
        className="admin-profile-preview admin-portrait-preview"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={currentUrl ? "Replace profile image" : "Upload profile image"}
      >
        {currentUrl ? <img src={currentUrl} alt="Current profile" /> : <span className="admin-portrait-initials">RJC</span>}
        <span className="admin-portrait-upload-button">
          {uploading ? "Uploading…" : currentUrl ? "Replace image" : "Upload image"}
        </span>
      </button>
      <input
        ref={inputRef}
        className="admin-portrait-file-input"
        name="portrait"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        onChange={(event) => {
          if (!event.currentTarget.files?.length) return;
          setUploading(true);
          formRef.current?.requestSubmit();
        }}
      />
    </form>
  );
}