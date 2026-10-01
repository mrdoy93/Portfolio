export type ProjectKind = "UGC Video" | "Technical" | "Creative";

export type Project = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  kind: ProjectKind;
  client: string | null;
  year: string;
  role: string;
  deliverables: string[];
  tools: string[];
  video_embed_url: string | null;
  thumbnail_url: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
};

