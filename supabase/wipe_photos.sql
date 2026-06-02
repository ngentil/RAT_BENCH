-- Wipe all base64 photos from every table.
-- Run once in Supabase SQL Editor. Irreversible.

UPDATE machines        SET photos = '[]'     WHERE photos     IS NOT NULL AND photos     <> '[]';
UPDATE machines        SET i_p_photos = '[]' WHERE i_p_photos IS NOT NULL AND i_p_photos <> '[]';
UPDATE machines        SET e_p_photos = '[]' WHERE e_p_photos IS NOT NULL AND e_p_photos <> '[]';

-- services table stores spark plug photos and job photos per service entry
UPDATE services        SET photos     = '[]' WHERE photos     IS NOT NULL AND photos     <> '[]';
UPDATE services        SET i_p_photos = '[]' WHERE i_p_photos IS NOT NULL AND i_p_photos <> '[]';
UPDATE services        SET e_p_photos = '[]' WHERE e_p_photos IS NOT NULL AND e_p_photos <> '[]';
UPDATE services        SET job_photos = '[]' WHERE job_photos IS NOT NULL AND job_photos <> '[]';

UPDATE clients         SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
UPDATE vehicles        SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
UPDATE equipment       SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
UPDATE tools           SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
UPDATE consumables     SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
UPDATE inventory_items SET photos = '[]' WHERE photos IS NOT NULL AND photos <> '[]';
