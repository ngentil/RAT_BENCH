-- Create public documents bucket and RLS policies. Separate from the
-- 'photos' bucket since that one's allowed_mime_types is images-only — PDFs
-- need their own bucket with their own size limit.
-- Run once in Supabase SQL Editor.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', true,
  26214400,  -- 25 MB per file (manuals/spec sheets run bigger than photos)
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload files into their own folder ({userId}/...)
CREATE POLICY "users upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Authenticated users can delete their own files
CREATE POLICY "users delete own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Anyone can read (public bucket — URLs are unguessable UUIDs)
CREATE POLICY "public read documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

-- Admin accounts can delete any user's uploaded document (mirrors
-- admin_storage_policy.sql's "admin delete any photo").
CREATE POLICY "admin delete any document"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND is_admin_user());
