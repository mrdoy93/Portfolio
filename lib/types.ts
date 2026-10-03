export const PROJECT_CATEGORIES = [
  "AI Videos",
  "AI Images",
  "Product Promotions",
  "Projects",
  "Hobbies",
] as const;

export type ProjectKind = (typeof PROJECT_CATEGORIES)[number];

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
  project_media_url: string | null;
  project_media_path: string | null;
  project_media_type: string | null;
  thumbnail_url: string | null;
  thumbnail_path: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
};
