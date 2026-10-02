import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type SiteSettings = {
  portrait_url: string | null;
  portrait_path: string | null;
  intro_video_url: string | null;
  intro_video_path: string | null;
};

const defaultSettings: SiteSettings = {
  portrait_url: null,
  portrait_path: null,
  intro_video_url: null,
  intro_video_path: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return defaultSettings;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("portrait_url, portrait_path, intro_video_url, intro_video_path")
    .eq("id", "site")
    .maybeSingle();

  if (error || !data) return defaultSettings;
  return data as SiteSettings;
}
