-- Sequential invoice numbering per user, per year.
-- Stores the counter in profiles.preferences under key "invoice_seq_<year>".
-- FOR UPDATE on the profiles row serializes concurrent calls so no two invoices
-- get the same number.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION next_invoice_number(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_year int  := date_part('year', now())::int;
  v_key  text := 'invoice_seq_' || v_year;
  v_prefs jsonb;
  v_next  int;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COALESCE(preferences, '{}'::jsonb) INTO v_prefs
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  v_next := COALESCE((v_prefs ->> v_key)::int, 0) + 1;

  UPDATE profiles
  SET preferences = v_prefs || jsonb_build_object(v_key, v_next)
  WHERE id = p_user_id;

  RETURN 'INV-' || v_year || '-' || lpad(v_next::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION next_invoice_number(uuid) TO authenticated;
