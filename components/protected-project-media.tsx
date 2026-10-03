"use client";

import type { SyntheticEvent } from "react";

type ProtectedProjectMediaProps = {
  src: string;
  contentType: string | null;
  title: string;
};

export function ProtectedProjectMedia({ src, contentType, title }: ProtectedProjectMediaProps) {
  const preventSave = (event: SyntheticEvent) => event.preventDefault();

  if (contentType?.startsWith("image/")) {
    return (
      <div className="protected-project-media" onContextMenu={preventSave}>
        <img src={src} alt={title} draggable={false} onDragStart={preventSave} />
      </div>
    );
  }

  return (
    <video
      className="protected-project-media"
      src={src}
      controls
      controlsList="nodownload noplaybackrate noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      playsInline
      preload="metadata"
      onContextMenu={preventSave}
      onDragStart={preventSave}
    />
  );
}
