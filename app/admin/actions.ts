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
