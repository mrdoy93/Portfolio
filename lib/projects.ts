import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const demoProjects: Project[] = [
  {
    id: "demo-01", title: "Everyday performance", slug: "everyday-performance", kind: "UGC Video", client: "Activewear launch", year: "2025", role: "Creator · editor", deliverables: ["3 vertical videos", "6 cutdowns"], tools: ["CapCut", "Premiere Pro"], video_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: null, featured: true, published: true, published_at: "2025-05-12", excerpt: "A fast, tactile product story designed for short-form discovery.", description: "Built around movement, honest product moments, and a repeatable opening hook for a paid and organic social campaign."
  },
  {
    id: "demo-02", title: "Creator analytics studio", slug: "creator-analytics-studio", kind: "Technical", client: "Independent build", year: "2025", role: "Product design · front-end", deliverables: ["Design system", "Analytics dashboard"], tools: ["Next.js", "Supabase", "Tailwind"], video_embed_url: null, thumbnail_url: null, featured: true, published: true, published_at: "2025-03-20", excerpt: "A focused dashboard that turns campaign performance into clear next steps.", description: "A compact technical project that makes key content signals easy to scan: reach, watch-through, engagement and the creative patterns behind them."
  },
  {
    id: "demo-03", title: "First-use ritual", slug: "first-use-ritual", kind: "UGC Video", client: "Skincare concept", year: "2024", role: "Creative direction · creator", deliverables: ["Concept", "2 vertical videos"], tools: ["Premiere Pro", "Lightroom"], video_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail_url: null, featured: true, published: true, published_at: "2024-11-18", excerpt: "A calm, considered unboxing and first-impression story.", description: "A product-first creator concept with a visual rhythm designed for retention and a natural call to action."
  }
];

function normalize(project: Project): Project {
  return { ...project, deliverables: project.deliverables ?? [], tools: project.tools ?? [] };
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return demoProjects;
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("published", true).order("published_at", { ascending: false });
  return error || !data ? demoProjects : (data as Project[]).map(normalize);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getPublishedProjects()).filter((project) => project.featured).slice(0, 3);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (!isSupabaseConfigured()) return demoProjects.find((project) => project.slug === slug);
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return data ? normalize(data as Project) : undefined;
}

