"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const videoTypes: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

type IntroVideoUploaderProps = {
  currentUrl: string | null;
  currentPath: string | null;
  posterUrl: string | null;
};

export function IntroVideoUploader({ currentUrl, currentPath, posterUrl }: IntroVideoUploaderProps) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(currentUrl);
  const [videoPath, setVideoPath] = useState(currentPath);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("intro_video");

    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose an MP4 or WebM video.");
      return;
    }

    const extension = videoTypes[file.type];
    if (!extension) {
      setMessage("Use an MP4 or WebM video.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setMessage("Your introduction video must be smaller than 25 MB.");
      return;
    }

    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error: bucketError } = await supabase.storage.updateBucket("portfolio-assets", {
      public: true,
      fileSizeLimit: MAX_VIDEO_SIZE,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"],
    });

    if (bucketError) {
      setMessage(`Storage setup failed: ${bucketError.message}`);
      setBusy(false);
      return;
    }

    const nextPath = `intro/intro-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-assets")
      .upload(nextPath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setMessage(uploadError.message);
      setBusy(false);
      return;
    }

    const { data: publicVideo } = supabase.storage
      .from("portfolio-assets")
      .getPublicUrl(nextPath);
    const { error: settingsError } = await supabase.from("site_settings").upsert({
      id: "site",
      intro_video_url: publicVideo.publicUrl,
      intro_video_path: nextPath,
      updated_at: new Date().toISOString(),
    });

    if (settingsError) {
      await supabase.storage.from("portfolio-assets").remove([nextPath]);
      setMessage(settingsError.message);
      setBusy(false);
      return;
    }

    if (videoPath && videoPath !== nextPath) {
      await supabase.storage.from("portfolio-assets").remove([videoPath]);
    }

    setVideoUrl(publicVideo.publicUrl);
    setVideoPath(nextPath);
    setMessage("Introduction video saved.");
    setBusy(false);
    form.reset();
    router.refresh();
  }

  async function removeVideo() {
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({
      id: "site",
      intro_video_url: null,
      intro_video_path: null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    if (videoPath) await supabase.storage.from("portfolio-assets").remove([videoPath]);
    setVideoUrl(null);
    setVideoPath(null);
    setMessage("Introduction video removed.");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="admin-profile-editor admin-video-editor">
      <div className="admin-profile-preview admin-video-preview">
        {videoUrl ? (
          <video src={videoUrl} poster={posterUrl || undefined} autoPlay muted loop playsInline controls />
        ) : (
          <span aria-hidden="true">▶</span>
        )}
      </div>
      <div className="admin-profile-controls">
        <form onSubmit={uploadVideo}>
          <label className="admin-field">
            Choose an introduction video
            <input name="intro_video" type="file" accept="video/mp4,video/webm" required disabled={busy} />
          </label>
          <p>MP4 or WebM, maximum 25 MB. The homepage plays it automatically without sound.</p>
          <button className="admin-primary-button" disabled={busy}>
            {busy ? "Saving…" : videoUrl ? "Replace video" : "Upload video"}
          </button>
        </form>
        {videoUrl && <button className="admin-remove-photo" type="button" onClick={removeVideo} disabled={busy}>Remove video</button>}
        {message && <p className="admin-upload-message" role="status">{message}</p>}
      </div>
    </div>
  );
}
