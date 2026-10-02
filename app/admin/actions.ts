"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toVideoEmbedUrl } from "@/lib/video";

const value = (form: FormData, key: string) => String(form.get(key) || "").trim();
const list = (form: FormData, key: string) => value(form, key).split(",").map((item) => item.trim()).filter(Boolean);

export async function saveProject(form: FormData) {
  const supabase = await createClient();
  const id = value(form, "id");
  const title = value(form, "title");
  const slug = value(form, "slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const project = { title, slug, kind: value(form, "kind"), client: value(form, "client") || null, year: value(form, "year"), role: value(form, "role"), excerpt: value(form, "excerpt"), description: value(form, "description"), video_embed_url: toVideoEmbedUrl(value(form, "video_embed_url")), thumbnail_url: value(form, "thumbnail_url") || null, deliverables: list(form, "deliverables"), tools: list(form, "tools"), featured: form.get("featured") === "on", published: form.get("published") === "on", published_at: new Date().toISOString() };
  const { error } = id ? await supabase.from("projects").update(project).eq("id", id) : await supabase.from("projects").insert(project);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/"); revalidatePath("/work"); redirect("/admin");
}

export async function deleteProject(form: FormData) { const supabase = await createClient(); const { error } = await supabase.from("projects").delete().eq("id", value(form, "id")); if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`); revalidatePath("/"); revalidatePath("/work"); redirect("/admin"); }

export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }

const portraitTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function savePortrait(form: FormData) {
  const portrait = form.get("portrait");
  if (!(portrait instanceof File) || portrait.size === 0) {
    redirect("/admin?error=Choose+an+image+to+upload.#profile");
  }

  const extension = portraitTypes[portrait.type];
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
