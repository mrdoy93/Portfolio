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
  const slug = value(form, "slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const kind = value(form, "kind");

  if (!PROJECT_CATEGORIES.includes(kind as ProjectKind)) {
    projectError("Choose a valid project category.", id);
  }

  const thumbnail = form.get("thumbnail_file");
  const hasThumbnail = thumbnail instanceof File && thumbnail.size > 0;
  if (hasThumbnail && !imageTypes[thumbnail.type]) {
    projectError("Use a JPG, PNG, or WebP thumbnail.", id);
  }
  if (hasThumbnail && thumbnail.size > 5 * 1024 * 1024) {
    projectError("The project thumbnail must be smaller than 5 MB.", id);
  }

  const { data: current, error: currentError } = id
    ? await supabase.from("projects").select("thumbnail_url, thumbnail_path").eq("id", id).maybeSingle()
    : { data: null, error: null };
  if (currentError) projectError(currentError.message, id);

  const manualThumbnailUrl = value(form, "thumbnail_url") || null;
  let thumbnailUrl = manualThumbnailUrl;
  let thumbnailPath = manualThumbnailUrl === current?.thumbnail_url ? current?.thumbnail_path || null : null;
  let uploadedPath: string | null = null;

  if (hasThumbnail) {
    const extension = imageTypes[thumbnail.type];
    uploadedPath = `projects/${categoryFolder(kind as ProjectKind)}/${slug}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-assets")
      .upload(uploadedPath, thumbnail, { contentType: thumbnail.type, upsert: false });
    if (uploadError) projectError(uploadError.message, id);

    const { data: publicImage } = supabase.storage.from("portfolio-assets").getPublicUrl(uploadedPath);
    thumbnailUrl = publicImage.publicUrl;
    thumbnailPath = uploadedPath;
  }

  const project = {
    title,
    slug,
    kind,
    client: value(form, "client") || null,
    year: value(form, "year"),
    role: value(form, "role"),
    excerpt: value(form, "excerpt"),
    description: value(form, "description"),
    video_embed_url: toVideoEmbedUrl(value(form, "video_embed_url")),
    thumbnail_url: thumbnailUrl,
    thumbnail_path: thumbnailPath,
    deliverables: list(form, "deliverables"),
    tools: list(form, "tools"),
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    published_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("projects").update(project).eq("id", id)
    : await supabase.from("projects").insert(project);

  if (error) {
    if (uploadedPath) await supabase.storage.from("portfolio-assets").remove([uploadedPath]);
    projectError(error.message, id);
  }

  if (current?.thumbnail_path && current.thumbnail_path !== thumbnailPath) {
    await supabase.storage.from("portfolio-assets").remove([current.thumbnail_path]);
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  redirect("/admin#projects");
}

export async function deleteProject(form: FormData) {
  const supabase = await createClient();
  const id = value(form, "id");
  const { data: current } = await supabase.from("projects").select("slug, thumbnail_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}#projects`);
  if (current?.thumbnail_path) await supabase.storage.from("portfolio-assets").remove([current.thumbnail_path]);
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
