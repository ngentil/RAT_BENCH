-- Add ON DELETE CASCADE to clients.user_id foreign key.
-- Without it, deleting an auth.users row that still has clients rows either
-- fails with an FK violation (if not handled) or leaves orphans.
-- The admin_delete_user RPC manually deletes clients, but any other deletion
-- path (Supabase dashboard, future self-service delete) would hit the FK.
-- Run in Supabase SQL Editor.

ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clients_user_id_fkey,
  ADD CONSTRAINT clients_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
