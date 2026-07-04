-- Tighten the photos bucket so clients can't ENUMERATE the whole bucket.
-- Run in Supabase SQL Editor (or via connector). Safe to re-run.
--
-- Background: the original "public read photos" SELECT policy granted SELECT on
-- every object in the (public) photos bucket to the `public` role. For a PUBLIC
-- bucket, object access by URL is served from the /object/public/ CDN path and
-- does NOT consult this policy — so the only thing the broad policy actually
-- enabled was the authenticated Storage API's .list()/enumeration of ANY user's
-- folder. That let any client walk the bucket and pull photos they were never
-- given links to (customer/job photos included).
--
-- Fix: drop the blanket public SELECT and replace it with scoped listing —
--   • a user may list only their own {uid}/ folder (needed by deleteUserPhotos
--     during self-serve account cleanup), and
--   • an admin may list any folder (needed by the admin "Delete User" flow,
--     mirroring the existing "admin delete any photo" DELETE policy).
-- Image display is unaffected: the app renders photos from getPublicUrl() CDN
-- links, which don't go through storage.objects RLS on a public bucket.
--
-- Requires is_admin_user() from supabase/admin_storage_policy.sql.

DROP POLICY IF EXISTS "public read photos"    ON storage.objects;
DROP POLICY IF EXISTS "users list own photos" ON storage.objects;
DROP POLICY IF EXISTS "admin list any photo"  ON storage.objects;

-- Users can list (and API-read) only their own folder
CREATE POLICY "users list own photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'photos'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Admins can list any folder (parallels "admin delete any photo")
CREATE POLICY "admin list any photo"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'photos' AND is_admin_user());
