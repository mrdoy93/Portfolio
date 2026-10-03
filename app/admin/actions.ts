"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toVideoEmbedUrl } from "@/lib/video";
import { PROJECT_CATEGORIES, type ProjectKind } from "@/lib/types";

const value = (form: FormData, key: string) => String(form.get(key) || "").trim();
const list = (form: FormData, key: string) => value(form, key).split(",").map((item) => item.trim()).filter(Boolean);

function projectError(message: string, id?: string): never {
  const editQuery = id ? `&edit=${encodeURIComponent(id)}` : "";
  const anchor = id ? "#edit-project" : "#new-project";
  redirect(`/admin?error=${encodeURIComponent(message)}${editQuery}${anchor}`);
}

function categoryFolder(kind: ProjectKind) {
  return kind.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function saveProject(form: FormData) {
  const supabase = await createClient();
  const id = value(form, "id");
  const title = value(form, "title");
  if (!title) projectError("Add a project title.", id);
  const requestedSlug = (value(form, "slug") || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `project-${Date.now()}`;
  const kind = value(form, "kind");

  if (!PROJECT_CATEGORIES.includes(kind as ProjectKind)) {
    projectError("Choose a valid project category.", id);
  }
  const year = value(form, "year") || String(new Date().getFullYear());
  const role = value(form, "role") || "Creator";
  const excerpt = value(form, "excerpt") || title + " - " + kind;
  const description = value(form, "description") || excerpt;

  const { data: matchingSlugs, error: slugError } = await supabase
    .from("projects")
    .select("id, slug")
    .like("slug", `${requestedSlug}%`);
  if (slugError) projectError(slugError.message, id);

  const occupiedSlugs = new Set(
    (matchingSlugs || [])
      .filter((project) => project.id !== id)
      .map((project) => project.slug),
  );
  let slug = requestedSlug;
  let slugSuffix = 2;
  while (occupiedSlugs.has(slug)) {
    slug = `${requestedSlug}-${slugSuffix}`;
    slugSuffix += 1;
  }

  const thumbnail = form.get("thumbnail_file");
  const hasThumbnail = thumbnail instanceof File && thumbnail.size > 0;
  if (hasThumbnail && !imageTypes[thumbnail.type]) {
    projectError("Use a JPG, PNG, or WebP thumbnail.", id);
  }
  if (hasThumbnail && thumbnail.size > 5 * 1024 * 1024) {
    projectError("The project thumbnail must be smaller than 5 MB.", id);
  }

  const projectMedia = form.get("project_media_file");
  const hasProjectMedia = projectMedia instanceof File && projectMedia.size > 0;
  const selectedMediaKind = value(form, "project_media_kind") || (hasProjectMedia ? projectMedia.type.split("/")[0] : "video");
  if (hasProjectMedia && !projectMediaTypes[projectMedia.type]) {
    projectError("Upload a JPG, PNG, WebP, MP4, or WebM project file.", id);
  }
  if (hasProjectMedia && selectedMediaKind === "image" && !projectMedia.type.startsWith("image/")) {
    projectError("Choose Photo / image when uploading JPG, PNG, or WebP files.", id);
  }
  if (hasProjectMedia && selectedMediaKind === "video" && !projectMedia.type.startsWith("video/")) {
    projectError("Choose Video when uploading MP4 or WebM files.", id);
  }
  if (hasProjectMedia && !["image", "video"].includes(selectedMediaKind)) {
    projectError("Choose Video or Photo / image for the uploaded project file.", id);
  }
  if (hasProjectMedia && projectMedia.size > 25 * 1024 * 1024) {
    projectError("The project file must be smaller than 25 MB.", id);
  }

  const { data: current, error: currentError } = id
    ? await supabase.from("projects").select("thumbnail_url, thumbnail_path, project_media_url, project_media_path, project_media_type").eq("id", id).maybeSingle()
    : { data: null, error: null };
  if (currentError) projectError(currentError.message, id);

  const manualThumbnailUrl = value(form, "thumbnail_url") || null;
  let thumbnailUrl = manualThumbnailUrl;
  let thumbnailPath = manualThumbnailUrl === current?.thumbnail_url ? current?.thumbnail_path || null : null;
  let uploadedThumbnailPath: string | null = null;

  if (hasThumbnail) {
    const extension = imageTypes[thumbnail.type];
    uploadedThumbnailPath = `projects/${categoryFolder(kind as ProjectKind)}/thumbnails/${slug}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-assets")
      .upload(uploadedThumbnailPath, thumbnail, { contentType: thumbnail.type, upsert: false });
    if (uploadError) projectError(uploadError.message, id);

    const { data: publicImage } = supabase.storage.from("portfolio-assets").getPublicUrl(uploadedThumbnailPath);
    thumbnailUrl = publicImage.publicUrl;
    thumbnailPath = uploadedThumbnailPath;
  }

  const removeProjectMedia = form.get("remove_project_media") === "on";
  let projectMediaUrl = removeProjectMedia ? null : current?.project_media_url || null;
  let projectMediaPath = removeProjectMedia ? null : current?.project_media_path || null;
  let projectMediaType = removeProjectMedia ? null : current?.project_media_type || null;
  let uploadedProjectMediaPath: string | null = null;

  if (hasProjectMedia) {
    const extension = projectMediaTypes[projectMedia.type];
    uploadedProjectMediaPath = `projects/${categoryFolder(kind as ProjectKind)}/media/${slug}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-assets")
      .upload(uploadedProjectMediaPath, projectMedia, { contentType: projectMedia.type, upsert: false });
    if (uploadError) {
      if (uploadedThumbnailPath) await supabase.storage.from("portfolio-assets").remove([uploadedThumbnailPath]);
      projectError(uploadError.message, id);
    }

    const { data: publicMedia } = supabase.storage.from("portfolio-assets").getPublicUrl(uploadedProjectMediaPath);
    projectMediaUrl = publicMedia.publicUrl;
    projectMediaPath = uploadedProjectMediaPath;
    projectMediaType = projectMedia.type;
  }

  const project = {
    title,
    slug,
    kind,
    client: value(form, "client") || null,
    year,
    role,
    excerpt,
    description,
    video_embed_url: toVideoEmbedUrl(value(form, "video_embed_url")),
    project_media_url: projectMediaUrl,
    project_media_path: projectMediaPath,
    project_media_type: projectMediaType,
    thumbnail_url: thumbnailUrl,
    thumbnail_path: thumbnailPath,
    deliverables: list(form, "deliverables"),
    tools: list(form, "tools"),
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    published_at: new Date().toISOString(),
  };

  let saveResult = id
    ? await supabase.from("projects").update(project).eq("id", id)
    : await supabase.from("projects").insert(project);

  let slugRetry = 0;
  while (
    saveResult.error?.code === "23505" &&
    saveResult.error.message.includes("projects_slug_key") &&
    slugRetry < 3
  ) {
    slugRetry += 1;
    slug = `${requestedSlug}-${Date.now().toString(36)}-${slugRetry}`;
    project.slug = slug;
    saveResult = id
      ? await supabase.from("projects").update(project).eq("id", id)
      : await supabase.from("projects").insert(project);
  }

  if (saveResult.error) {
    const uploadedPaths = [uploadedThumbnailPath, uploadedProjectMediaPath].filter((path): path is string => Boolean(path));
    if (uploadedPaths.length > 0) await supabase.storage.from("portfolio-assets").remove(uploadedPaths);
    projectError(saveResult.error.message, id);
  }

  const replacedPaths = [
    current?.thumbnail_path && current.thumbnail_path !== thumbnailPath ? current.thumbnail_path : null,
    current?.project_media_path && current.project_media_path !== projectMediaPath ? current.project_media_path : null,
  ].filter((path): path is string => Boolean(path));
  if (replacedPaths.length > 0) await supabase.storage.from("portfolio-assets").remove(replacedPaths);

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  redirect("/admin#projects");
}
export async function deleteProject(form: FormData) {
  const supabase = await createClient();
  const id = value(form, "id");
  const { data: current } = await supabase.from("projects").select("slug, thumbnail_path, project_media_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}#projects`);
  const storedPaths = [current?.thumbnail_path, current?.project_media_path].filter((path): path is string => Boolean(path));
  if (storedPaths.length > 0) await supabase.storage.from("portfolio-assets").remove(storedPaths);
  revalidatePath("/");
  revalidatePath("/work");
  if (current?.slug) revalidatePath(`/work/${current.slug}`);
  redirect("/admin#projects");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
const projectMediaTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function savePortrait(form: FormData) {
  const portrait = form.get("portrait");
  if (!(portrait instanceof File) || portrait.size === 0) {
    redirect("/admin?error=Choose+an+image+to+upload.#profile");
  }

  const extension = imageTypes[portrait.type];
  if (!extension) {
    redirect("/admin?error=Use+a+JPG,+PNG,+or+WebP+image.#profile");
  }
  if (portrait.size > 5 * 1024 * 1024) {
    redirect("/admin?error=Your+profile+photo+must+be+smaller+than+5+MB.#profile");
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("site_settings")
    .select("portrait_path")
    .eq("id", "site")
    .maybeSingle();

  const portraitPath = `portrait/profile-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("portfolio-assets")
    .upload(portraitPath, portrait, { contentType: portrait.type, upsert: false });

  if (uploadError) redirect(`/admin?error=${encodeURIComponent(uploadError.message)}#profile`);

  const { data: publicImage } = supabase.storage
    .from("portfolio-assets")
    .getPublicUrl(portraitPath);
  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: "site",
    portrait_url: publicImage.publicUrl,
    portrait_path: portraitPath,
    updated_at: new Date().toISOString(),
  });

  if (settingsError) {
    await supabase.storage.from("portfolio-assets").remove([portraitPath]);
    redirect(`/admin?error=${encodeURIComponent(settingsError.message)}#profile`);
  }

  if (current?.portrait_path && current.portrait_path !== portraitPath) {
    await supabase.storage.from("portfolio-assets").remove([current.portrait_path]);
  }

  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin#profile");
}

export async function removePortrait() {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("site_settings")
    .select("portrait_path")
    .eq("id", "site")
    .maybeSingle();

  const { error } = await supabase.from("site_settings").upsert({
    id: "site",
    portrait_url: null,
    portrait_path: null,
    updated_at: new Date().toISOString(),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}#profile`);

  if (current?.portrait_path) {
    await supabase.storage.from("portfolio-assets").remove([current.portrait_path]);
  }

  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin#profile");
}
