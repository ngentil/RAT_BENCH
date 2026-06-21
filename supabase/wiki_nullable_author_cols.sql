-- Make wiki author FK columns nullable so user deletion orphans the references
-- rather than cascade-deleting community content.
-- Run once in Supabase SQL Editor before deploying the updated admin_delete_user function.

ALTER TABLE wiki_entries       ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE wiki_revisions     ALTER COLUMN edited_by  DROP NOT NULL;
ALTER TABLE wiki_contributions ALTER COLUMN user_id    DROP NOT NULL;
