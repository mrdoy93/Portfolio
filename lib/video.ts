const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");

  const [type, id] = url.pathname.split("/").filter(Boolean);
  return ["embed", "shorts", "live"].includes(type) ? id || null : null;
}

export function toVideoEmbedUrl(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;

  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    const videoId = youtubeId(url);
    if (videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts[0] === "video" ? parts[1] : parts[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }

    return url.toString();
  } catch {
    return null;
  }
}
