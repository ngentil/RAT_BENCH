-- Server-side rate limiting for Quote/Invoice generation, for abuse-
-- prevention purposes. Before this migration, nothing capped how fast a
-- scripted client with a valid session token could spam billing_documents
-- rows (or repeatedly merge over the same one) -- Quotes have no economic
-- throttle at all (see invoice_addon_billing.sql's cap, which only ever
-- applied to Invoices), and even Invoices could still be hammered within
-- whatever the monthly allowance/Business-plan ceiling permits.
--
-- Enforced via a single BEFORE INSERT/UPDATE trigger on billing_documents --
-- deliberately NOT spread across next_invoice_number/next_quote_number's own
-- call sites, since (a) charging the limit at both the number-mint step and
-- the write step would double-consume it for one real generation, and (b)
-- billing_documents' own INSERT/UPDATE is the one choke point every
-- generation path -- RPC-driven or a raw client .insert() alike -- is forced
-- through regardless of which code path got there, so it can't be bypassed
-- by skipping the "friendly" RPCs and hitting the table directly with a
-- valid JWT. next_invoice_number/next_quote_number are intentionally left
-- unlimited on their own: each is just an optional sequence-number mint with
-- no persisted growth of its own (already serialized by its own
-- profiles-row FOR UPDATE lock), and an attacker gains nothing hammering
-- them alone without ever completing a billing_documents write, which is
-- the actual resource this migration protects.
--
-- Two independent limits, each applied at both the acting user's own scope
-- AND (if they belong to one) their company's aggregate scope -- otherwise a
-- multi-seat org could dodge a company-wide cap by just spreading the same
-- abuse across several member accounts:
--   1. Burst/cooldown -- a token bucket, capacity 5, refilling 1 token every
--      2 seconds. Lets a real person generate a handful back-to-back, then
--      requires ~2s between further ones -- invisible to normal usage,
--      blocks a tight scripted loop.
--   2. Hourly ceiling -- a hard cap of 30 generations per rolling clock-hour,
--      independent of the bucket (a patient script respecting the 2s gap
--      would otherwise reach 30 within the first minute and keep going
--      forever after that).
--
-- Run in Supabase SQL Editor. Requires billing_documents.sql (for the table
-- this trigger attaches to) and profiles (for the company_id lookup).

CREATE TABLE IF NOT EXISTS _rate_limit_buckets (
  key         text PRIMARY KEY,
  tokens      numeric NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS _rate_limit_windows (
  key         text PRIMARY KEY,
  window_key  text NOT NULL,
  count       integer NOT NULL DEFAULT 0
);

-- Neither table is granted to `authenticated` at all -- only ever touched by
-- the SECURITY DEFINER functions below, same "internal helper, no direct
-- client access" convention as _set_billing_action_at in company_billing.sql.

-- Token-bucket check: returns true (and consumes a token) if under capacity,
-- false otherwise.
CREATE OR REPLACE FUNCTION _consume_rate_limit_token(p_key text, p_capacity numeric, p_refill_seconds numeric)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_tokens     numeric;
  v_updated_at timestamptz;
  v_elapsed    numeric;
  v_new_tokens numeric;
BEGIN
  SELECT tokens, updated_at INTO v_tokens, v_updated_at
  FROM _rate_limit_buckets WHERE key = p_key FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO _rate_limit_buckets (key, tokens, updated_at)
    VALUES (p_key, p_capacity - 1, now());
    RETURN true;
  END IF;

  v_elapsed    := GREATEST(0, EXTRACT(EPOCH FROM (now() - v_updated_at)));
  v_new_tokens := LEAST(p_capacity, v_tokens + v_elapsed / p_refill_seconds);

  IF v_new_tokens < 1 THEN
    UPDATE _rate_limit_buckets SET tokens = v_new_tokens, updated_at = now() WHERE key = p_key;
    RETURN false;
  END IF;

  UPDATE _rate_limit_buckets SET tokens = v_new_tokens - 1, updated_at = now() WHERE key = p_key;
  RETURN true;
END;
$$;

-- Fixed-window counter check: returns true (and increments) if under cap for
-- the current clock-hour, false otherwise -- resets automatically once the
-- window key rolls over to the next hour.
CREATE OR REPLACE FUNCTION _consume_rate_limit_window(p_key text, p_cap integer)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_window text := to_char(now(), 'YYYY-MM-DD-HH24');
  v_row    _rate_limit_windows;
BEGIN
  SELECT * INTO v_row FROM _rate_limit_windows WHERE key = p_key FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO _rate_limit_windows (key, window_key, count) VALUES (p_key, v_window, 1);
    RETURN true;
  END IF;

  IF v_row.window_key != v_window THEN
    UPDATE _rate_limit_windows SET window_key = v_window, count = 1 WHERE key = p_key;
    RETURN true;
  END IF;

  IF v_row.count >= p_cap THEN
    RETURN false;
  END IF;

  UPDATE _rate_limit_windows SET count = count + 1 WHERE key = p_key;
  RETURN true;
END;
$$;

-- Umbrella check applied to a single document-generation attempt (an insert
-- or a merge-update alike). Raises on the first limit hit -- user's own
-- burst, user's own hourly cap, then (if they belong to one) their
-- company's burst and hourly cap, in that order. Message text is prefixed
-- "RATE_LIMITED:" so the client can distinguish this from a generic DB/
-- connection error and show accurate copy instead of "check your
-- connection".
CREATE OR REPLACE FUNCTION _check_document_generation_rate_limit(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id FROM profiles WHERE id = p_user_id;

  IF NOT _consume_rate_limit_token('user:' || p_user_id, 5, 2) THEN
    RAISE EXCEPTION 'RATE_LIMITED: generating documents too quickly — please wait a moment and try again';
  END IF;
  IF NOT _consume_rate_limit_window('user:' || p_user_id, 30) THEN
    RAISE EXCEPTION 'RATE_LIMITED: hourly document generation limit reached for your account — please try again later';
  END IF;

  IF v_company_id IS NOT NULL THEN
    IF NOT _consume_rate_limit_token('company:' || v_company_id, 5, 2) THEN
      RAISE EXCEPTION 'RATE_LIMITED: this organisation is generating documents too quickly — please wait a moment and try again';
    END IF;
    IF NOT _consume_rate_limit_window('company:' || v_company_id, 30) THEN
      RAISE EXCEPTION 'RATE_LIMITED: hourly document generation limit reached for this organisation — please try again later';
    END IF;
  END IF;
END;
$$;

-- Trigger: fires on every billing_documents INSERT (createDocument, a brand
-- new Quote/Invoice) and UPDATE (mergeDocument's in-place merge) alike --
-- for both doc_type values, so Quotes are now rate-limited too even though
-- they have no monthly cap of their own.
CREATE OR REPLACE FUNCTION _billing_documents_rate_limit()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  PERFORM _check_document_generation_rate_limit(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_billing_documents_rate_limit ON billing_documents;
CREATE TRIGGER trg_billing_documents_rate_limit
BEFORE INSERT OR UPDATE ON billing_documents
FOR EACH ROW EXECUTE FUNCTION _billing_documents_rate_limit();
