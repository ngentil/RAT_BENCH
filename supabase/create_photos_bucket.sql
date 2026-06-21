-- Create public photos bucket and RLS policies.
-- Run once in Supabase SQL Editor.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos', 'photos', true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload files into their own folder ({userId}/...)
CREATE POLICY "users upload own photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Authenticated users can delete their own files
CREATE POLICY "users delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'photos'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Anyone can read (public bucket — URLs are unguessable UUIDs)
CREATE POLICY "public read photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'photos');
