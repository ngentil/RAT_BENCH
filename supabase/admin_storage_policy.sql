-- Allows admin accounts to delete any user's photos from Supabase Storage.
-- Required for the admin "Delete User" flow to also wipe the user's photo folder.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.email() = 'nathan.gentil.ai@gmail.com'
$$;

GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

CREATE POLICY "admin delete any photo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'photos' AND is_admin_user());
