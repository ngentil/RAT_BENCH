-- Add missing indexes on frequently-queried FK columns.
-- scalability_hardening.sql added idx_aperms_user_type (user_id, asset_type)
-- but omitted company_id. _is_company_member / _is_company_admin are called on
-- every policy evaluation — without a company_id index on company_members each
-- call is a sequential scan. Similarly, wiki_revisions.entry_id is unindexed
-- despite being the WHERE column in the revisions SELECT policy and getWikiRevisions().
-- Run in Supabase SQL Editor.

CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_aperms_company_id          ON asset_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_wiki_revisions_entry_id    ON wiki_revisions(entry_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_created_by    ON wiki_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id        ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_company_id       ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_tools_company_id           ON tools(company_id);
CREATE INDEX IF NOT EXISTS idx_consumables_company_id     ON consumables(company_id);
CREATE INDEX IF NOT EXISTS idx_mperms_company_id          ON machine_permissions(company_id);
