# Rodolfo Jr. Cortez portfolio

## Start locally

1. Install Node.js 22 LTS or newer, then run `npm install` and `npm run dev`.
2. Copy `.env.example` to `.env.local` and paste your Supabase Project URL and Publishable key.
3. In Supabase, run `supabase/schema.sql` in the SQL Editor.
4. Create your account in Supabase Authentication (email/password), then run the final `update public.profiles` command in `schema.sql` with your email to make that account an admin.
5. Visit `/login`, sign in, and manage content at `/admin`.
6. In the admin dashboard, open **Profile photo** to upload or replace the image shown in place of the RJC initials. JPG, PNG, and WebP files up to 5 MB are supported.

The public pages show tasteful sample projects until Supabase is connected. Replace `hello@example.com` and social links in the page components before launch.

For video projects, paste a public embed URL such as `https://www.youtube.com/embed/VIDEO_ID` or a Vimeo player embed URL. Do not paste a normal YouTube watch URL.
