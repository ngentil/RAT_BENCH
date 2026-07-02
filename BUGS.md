# RAT BENCH — Consolidated Bug Queue (Sweeps 1–5)

Status legend: `[ ]` open · `[x]` fixed · `[-]` won't fix / by design / already fixed

> Fix pass completed 2026-07-02. **Run `supabase/add_missing_machine_columns.sql`
> and `supabase/security_fixes_2026_07.sql` in the Supabase SQL Editor** — the
> client fixes for due dates, outboard fields, service notes, and the RLS
> hardening depend on them. Also redeploy the `create-checkout` edge function.

---

## P0 — Security & data leaks

- [x] **Wiki publish leaks private data** — STRIP_FIELDS extended (port/gasket photos, parts, time logs, timers, due dates, service history); carbSpec deep-cleaned.
- [x] **Wiki import copies cross-user storage URLs** — doImport strips private fields from old revisions.
- [x] **Admin check client-side only** — doSave gated on isAdmin; admin RPCs already enforce email server-side; wiki pointer RPC hardened.
- [-] **machine_bookings "own" policy** — already fixed by machine_bookings_ownership.sql; unique active index added on top.
- [x] **wiki_rev_pointer NULL bypass** — IS DISTINCT FROM (security_fixes_2026_07.sql).
- [x] **Owner demotion via cm_manage** — owner rows now untouchable via direct API.
- [x] **cm_leave / cm_manage_delete bypass cleanup RPCs** — direct DELETE removed; RPCs only.
- [x] **`_provisioned_machine_ids()` no company scope** — scoped to live membership.
- [x] **rpc_delete_company machine_permissions cleanup** — added.
- [-] **Billing rates changeable by any member** — rpc_update_company already requires owner/admin.
- [x] **Permission grantee not company member** — BEFORE INSERT/UPDATE trigger added.
- [ ] **Tier gating client-side for tools/vehicles/equipment/consumables** — needs DB triggers mirroring machines; deferred.
- [x] **grant_upgrade tier validation** — enthusiast/team/business only.
- [x] **admin_delete_user self-delete guard + upgrade_grants cleanup.**
- [-] **migrateLocalTools user_id scrubbing** — verified safe (`{...t, userId}` spread order + ignoreDuplicates).
- [-] **updateProfile any userId** — profiles_write RLS already restricts to own row.
- [-] **updateMemberRole direct table write** — now constrained by cm_manage_update (admin-only, owner rows excluded).
- [x] **LIKE wildcard injection** — escapeLike on all wiki ilike calls; search tokens sanitized at the .or() sink.
- [x] **Stripe double-charge + fail-open allowlist** — active-subscription guard; allowlist fails closed.
- [ ] **Photos bucket world-readable forever** — needs signed-URL architecture; deferred (URLs are unguessable UUIDs; wiki leak path closed).

## P0 — Data loss / corruption

- [x] **dueDate / 13 outboard fields / compressionRatio / totalLoadWatts / groundContactLength / lastServiceNotes missing from transforms** — mapped; requires `add_missing_machine_columns.sql`.
- [x] **`isNew=true` hardcoded** — now `!e.id` (template prefills still open expanded).
- [ ] **Whole-row last-write-wins races (JobBoard/upsertMachine)** — mitigated with in-flight guards + rollback; true fix needs column-level partial updates. Deferred.
- [x] **Service completed_at timezone corruption** — datetime-local ↔ ISO conversion both ways; validation on empty.
- [x] **Machine delete destroys photos before failed row delete** — children→row→photos ordering; carb gasket photos included; errors thrown and surfaced.
- [x] **delSvc / deleteClient photo-first ordering** — row delete first everywhere; deleteClientApi single cleanup path (was double-deleting).
- [x] **PhotoAdder ✕ deletes from storage before save** — removal is now form-state only; ServiceModal defers deletion until after successful save.
- [x] **PlugLog retake destroys both photos on flaky upload** — upload-then-delete ordering; in-flight guard; error toasts.
- [x] **Legacy job_timer new UUID per read** — stable `legacy-<machineId>` id.
- [x] **migrateLocalInventory lsKey ReferenceError.**
- [x] **upsertService PK-reuse confusion** — auth guard + permission error on PK violation.
- [x] **PartsSection.remove stock rollback** — partial failures surfaced honestly; adjustStock now throws so rollback paths are live.
- [x] **rpc_update_company COALESCE empty-string** — present-key semantics; fields clearable.
- [-] **Photos uploaded at selection orphaned on form cancel** — accepted tradeoff (orphan file beats broken saved record); revisit with a deferred-upload queue if storage costs bite.
- [x] **Promise.all multi-upload discards successes** — allSettled, partial-failure message.
- [x] **saveSvc stale closure** — functional setState.

## P1 — Money / billing correctness

- [x] **Invoices re-bill invoiced sessions** — filtered out + auto-marked invoiced after export (cycle the status chip to re-issue).
- [x] **Countdown finish bills raw elapsed** — clamped to duration; 0-second entries skipped.
- [x] **Invoice rows don't sum to totals** — per-line cent rounding, rounded subtotals/tax/total.
- [x] **Random fallback invoice numbers collide** — timestamp-based, logged.
- [x] **qty 0 billed as 1** — explicit 0 respected everywhere (invoice, dashboard, client invoice, parts totals).
- [x] **Storage revenue/client invoices ignore custom tiers** — tiers passed through; minFee no longer applies during free period.
- [-] **Dashboard counts non-invoiced work as revenue** — by design: it reports value of work done, not receivables. Revisit if a receivables view is wanted.
- [x] **Custom range UTC/local inconsistency; rolling week; future entries** — shared inPeriod: calendar week (Mon local), local-day bounds.
- [x] **Undated parts excluded from All Time.**
- [x] **Stale `now` in dashboard memos** — minute tick.
- [x] **fmtMoney NaN/negative/huge** — guarded, `-$x.xx` format.
- [x] **hourly_rate=0 treated as unset; `$120` wipes rate** — isFinite checks; parseNum validation in billing settings.
- [x] **Double bookings** — client guard + DB partial unique index (+ dedup of existing).
- [x] **createBooking null-user crash; booking queries swallow errors; doCollect silent failure.**
- [x] **Due-date / service-reminder UTC-midnight skew** — parseLocalDate/daysSinceLocal everywhere.
- [ ] **Month interval = n×30 days approximation** — deliberate simplification; deferred.

## P1 — Reliability / stuck states

- [-] **No React error boundary** — already exists (main.jsx wraps all roots; Sentry wired).
- [x] **ServiceModal / ServiceReminders / EquipmentForm stuck saving states** — try/catch + saving reset + toasts through the whole chain.
- [x] **ServiceModal completedAt validation; plug upload empty catch.**
- [x] **PlugLog no in-flight guard / no error handling / stale MachineCard cache** — guard added; MachineCard refetches services on every open.
- [x] **upsertService no auth guard.**
- [x] **JobBoard mutations fire-and-forget** — optimistic update + rollback + toast for entries, bill status, notes, machine notes, status, rage, timer ops.
- [x] **updateClient / cover photo silent failures; exportClientInvoice popup crash.**
- [x] **handleFinish 0-second entries; timer start double-tap; getElapsed NaN/future-start.**
- [x] **Pref-restore double-migration race; prefsSynced not reset on signout; workshop_visible non-array crash.**
- [ ] **Billing success banner stops polling at 16s with no error state** — minor; deferred.
- [-] **deleteUserPhotos 1000-file cap / resizeToBlob height+URL leak** — already fixed in current storage.js (stale findings).
- [-] **getMachines / asset UPDATEs rely on RLS scoping** — by design; RLS policies verified present.
- [x] **Realtime UPDATE-only** — INSERT/DELETE handled; teammates' machines appear live.
- [x] **StockItemTab numeric edge cases** — parseNum everywhere, margin ÷0 guards, stock floor, error feedback.
- [ ] **Scientific notation accepted in MachineForm year/spec fields** — cosmetic; deferred.
- [x] **MachineForm overlay click loses data** — confirm dialog.
- [x] **WikiAutocomplete / WikiHomePage search / WikiEntryPage fetch races** — request-sequence guards.
- [x] **getMyCompany missing import in CompanySettings; cleanup-duplicates null crash; detectType 'Outboard Motor'.**
- [-] **deleteServiceApi doesn't clean photos on non-UI paths** — machine-delete path covers cascade; admin path acceptable.

## P2 — Navigation / UX / polish

- [x] **backGuard 3-press exit** — second press exits; guard skips legal pages.
- [x] **MachineCard history-entry leak** — manual collapse pops its entry; guide effect deps; services/booking refetch on machine change.
- [x] **No trailing-slash/case tolerance; legal pages missing back button; hard-coded logo URL.**
- [x] **Wiki slug / /m/:id not URL-decoded.**
- [x] **OAuth drops ?template deep link** — path+query preserved through redirect.
- [ ] **Hard-coded wiki.ratbench.net host check / links** — breaks staging previews; deferred (needs env-based host config).
- [x] **document.title static** — wiki entry pages set titles; app tabs deferred.
- [x] **WikiApp doesn't pass session** — admin editing works on the subdomain.
- [x] **WikiHistoryPage not-found handling; Tracker template RPC catch.**
- [-] **fmtDuration/fmtHrs drop seconds when h>0** — by design ("2h 5m" is the right granularity); negative/NaN guards added.
- [ ] **Wiki search capped at 50 results** — needs pagination; deferred.
- [x] **Chipper/Stump Grinder in ALL_TYPES; Jet Ski in type picker + correct sections.**
- [x] **Array index keys on photo grids** — PhotoAdder (the shared grid) uses URL keys.
- [-] **Asymmetric || null vs || "" transforms** — value-lossless; left as-is.
