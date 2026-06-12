-- Returns a read-only snapshot of a machine for the public /m/:id page.
-- No auth required — intentionally public.
-- Run once in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION get_public_machine(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_machine jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id',                m.id,
    'name',              m.name,
    'type',              m.type,
    'make',              m.make,
    'model',             m.model,
    'year',              m.year,
    'notes',             m.notes,
    'last_service_date', m.last_service_date,
    'last_service_odo',  m.last_service_odo,
    'time_log',          COALESCE(m.time_log, '[]'::jsonb),
    'photos',            COALESCE(m.photos,   '[]'::jsonb)
  )
  INTO v_machine
  FROM machines m
  WHERE m.id = p_id;

  RETURN v_machine;
END;
$$;

-- Grant execute to anon so unauthenticated visitors can fetch
GRANT EXECUTE ON FUNCTION get_public_machine(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_public_machine(uuid) TO authenticated;
