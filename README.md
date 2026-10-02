# Rodolfo Jr. Cortez portfolio

## Start locally

1. Install Node.js 22 LTS or newer, then run `npm install` and `npm run dev`.
2. Copy `.env.example` to `.env.local` and paste your Supabase Project URL and Publishable key.
3. In Supabase, run `supabase/schema.sql` in the SQL Editor.
4. In Supabase Storage, create a public bucket named `portfolio-assets`, set its file limit to 25 MB, and allow JPG, PNG, WebP, MP4, and WebM files.
5. Create your account in Supabase Authentication (email/password), then run the final `update public.profiles` command in `schema.sql` with your email to make that account an admin.
6. Visit `/login`, sign in, and manage content at `/admin`.
7. In the admin dashboard, open **Profile media** to upload the portrait and homepage introduction video. The admin verifies the bucket allows MP4/WebM before uploading; the homepage video autoplays muted and inline.

The public pages show tasteful sample projects until Supabase is connected. Replace `hello@example.com` and social links in the page components before launch.

For video projects, paste a public embed URL such as `https://www.youtube.com/embed/VIDEO_ID` or a Vimeo player embed URL. Do not paste a normal YouTube watch URL.
