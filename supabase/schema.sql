-- Run this file in the Supabase SQL Editor before using /admin.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  description text not null,
  kind text not null check (kind in ('UGC Video', 'Technical', 'Creative')),
  client text,
  year text not null,
  role text not null,
  deliverables text[] not null default '{}',
  tools text[] not null default '{}',
  video_embed_url text,
  thumbnail_url text,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'site',
  portrait_url text,
  portrait_path text,
  intro_video_url text,
  intro_video_path text,
  updated_at timestamptz not null default now(),
  constraint single_site_settings_row check (id = 'site')
);

alter table public.site_settings add column if not exists intro_video_url text;
alter table public.site_settings add column if not exists intro_video_path text;

-- In Storage, create a public bucket named "portfolio-assets" with a 25 MB limit.
-- Allow: image/jpeg, image/png, image/webp, video/mp4, and video/webm.
create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "users can see own profile" on public.profiles;
drop policy if exists "anyone can read published projects" on public.projects;
drop policy if exists "admins can add projects" on public.projects;
drop policy if exists "admins can edit projects" on public.projects;
drop policy if exists "admins can delete projects" on public.projects;
drop policy if exists "anyone can read site settings" on public.site_settings;
drop policy if exists "admins can add site settings" on public.site_settings;
drop policy if exists "admins can edit site settings" on public.site_settings;
drop policy if exists "admins can view portfolio bucket" on storage.buckets;
drop policy if exists "admins can update portfolio bucket" on storage.buckets;
drop policy if exists "public can view portfolio assets" on storage.objects;
drop policy if exists "admins can upload portfolio assets" on storage.objects;
drop policy if exists "admins can update portfolio assets" on storage.objects;
drop policy if exists "admins can delete portfolio assets" on storage.objects;

create policy "users can see own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "anyone can read published projects" on public.projects for select using (published = true or public.is_admin());
create policy "admins can add projects" on public.projects for insert to authenticated with check (public.is_admin());
create policy "admins can edit projects" on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can delete projects" on public.projects for delete to authenticated using (public.is_admin());
create policy "anyone can read site settings" on public.site_settings for select using (true);
create policy "admins can add site settings" on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "admins can edit site settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can view portfolio bucket" on storage.buckets for select to authenticated using (id = 'portfolio-assets' and public.is_admin());
create policy "admins can update portfolio bucket" on storage.buckets for update to authenticated using (id = 'portfolio-assets' and public.is_admin()) with check (id = 'portfolio-assets' and public.is_admin());
create policy "public can view portfolio assets" on storage.objects for select using (bucket_id = 'portfolio-assets');
create policy "admins can upload portfolio assets" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-assets' and public.is_admin());
create policy "admins can update portfolio assets" on storage.objects for update to authenticated using (bucket_id = 'portfolio-assets' and public.is_admin()) with check (bucket_id = 'portfolio-assets' and public.is_admin());
create policy "admins can delete portfolio assets" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-assets' and public.is_admin());

-- After creating your user in Supabase Auth, run this once with your own email.
-- This also creates the profile if the Auth user existed before this schema was installed:
-- insert into public.profiles (id, email, role)
-- select id, email, 'admin' from auth.users where email = 'your-email@example.com'
-- on conflict (id) do update set role = 'admin', email = excluded.email;
