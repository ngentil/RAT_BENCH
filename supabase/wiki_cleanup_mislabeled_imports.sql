-- One-off data cleanup (applied 2026-07-03) — record kept for reproducibility.
-- The Wikipedia motorcycle import produced 87 rows where `make` is one brand
-- but `model` starts with a DIFFERENT known brand (e.g. make="Aprilia",
-- model="Honda VFR750R"). 84 of these already had a correct twin entry and were
-- deleted as redundant junk; 2 unique ones were relabeled from the model; the
-- Triumph Daytona 600 was a false positive (a real Triumph model whose first
-- word happens to match a clone-engine "Daytona" make) and was left untouched.

DO $$
DECLARE
  del_ids uuid[];
BEGIN
  SELECT array_agg(m.id) INTO del_ids
  FROM (
    SELECT e.id,
           initcap(split_part(btrim(e.model),' ',1)) AS rmk,
           btrim(substr(btrim(e.model), length(split_part(btrim(e.model),' ',1))+2)) AS rmd
    FROM wiki_entries e
    JOIN (SELECT DISTINCT lower(make) m FROM wiki_entries WHERE NOT is_sample AND make IS NOT NULL) mk
      ON mk.m = lower(split_part(btrim(e.model),' ',1))
    WHERE NOT e.is_sample AND lower(split_part(btrim(e.model),' ',1)) <> lower(e.make)
  ) m
  WHERE EXISTS (SELECT 1 FROM wiki_entries w WHERE NOT w.is_sample
     AND lower(w.make)=lower(m.rmk) AND lower(w.model)=lower(m.rmd));

  DELETE FROM wiki_contributions WHERE entry_id = ANY(del_ids);
  UPDATE wiki_entries SET current_rev_id = NULL WHERE id = ANY(del_ids);
  DELETE FROM wiki_revisions WHERE entry_id = ANY(del_ids);
  DELETE FROM wiki_entries WHERE id = ANY(del_ids);

  RAISE NOTICE 'deleted % mislabeled duplicate entries', coalesce(array_length(del_ids,1),0);
END $$;

UPDATE wiki_entries SET make='Triumph', model='Speed Four'
  WHERE NOT is_sample AND make='Suzuki' AND model='Triumph Speed Four';
UPDATE wiki_entries SET make='Baja', model='100'
  WHERE NOT is_sample AND make='Harley-Davidson' AND model='Baja 100';
