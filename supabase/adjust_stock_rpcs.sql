-- Atomic stock adjustment RPCs — replaces client-side read-modify-write pattern
-- that was vulnerable to race conditions under concurrent use.
-- Run in Supabase SQL Editor.

-- ── adjust_consumable_qty ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION adjust_consumable_qty(p_id uuid, p_delta numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_qty numeric;
BEGIN
  UPDATE consumables
  SET quantity   = GREATEST(0, quantity + p_delta),
      updated_at = now()
  WHERE id = p_id
    AND user_id = auth.uid()
  RETURNING quantity INTO v_new_qty;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Not found or access denied');
  END IF;

  RETURN jsonb_build_object('ok', true, 'quantity', v_new_qty);
END;
$$;

GRANT EXECUTE ON FUNCTION adjust_consumable_qty(uuid, numeric) TO authenticated;


-- ── adjust_inventory_stock ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION adjust_inventory_stock(p_item_id uuid, p_delta numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_qty numeric;
  v_payload jsonb;
BEGIN
  SELECT payload INTO v_payload
  FROM   inventory_items
  WHERE  id      = p_item_id
    AND  user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Not found or access denied');
  END IF;

  v_new_qty := GREATEST(0, (COALESCE((v_payload->>'stockQty')::numeric, 0) + p_delta));

  UPDATE inventory_items
  SET payload    = jsonb_set(v_payload, '{stockQty}', to_jsonb(v_new_qty), true),
      updated_at = now()
  WHERE id = p_item_id;

  RETURN jsonb_build_object('ok', true, 'stockQty', v_new_qty);
END;
$$;

GRANT EXECUTE ON FUNCTION adjust_inventory_stock(uuid, numeric) TO authenticated;
