# RAT BENCH — Consolidated Bug Queue (Sweeps 1–5)

Status legend: `[ ]` open · `[x]` fixed · `[-]` won't fix / by design

---

## P0 — Security & data leaks

- [ ] **Wiki publish leaks private data** — `src/lib/wiki.js:175` STRIP_FIELDS omits `iPPhotos`, `ePPhotos`, `carbSpec` (gasketPhotos, purchaseLinks), `parts`, `timeLog`, `jobTimers`, `dueDate`. Publishing a machine exposes private photo URLs, parts costs, and job data in public wiki revisions.
- [ ] **Wiki import copies cross-user storage URLs** — `src/components/wiki/WikiEntryPage.jsx:71` doImport spreads entire wiki revision into upsertMachine; importer's machine references files in another user's storage folder (break when owner deletes).
- [ ] **Admin check client-side only** — `ADMIN_EMAILS` array in WikiEntryPage; `doSave` missing isAdmin guard; `doImport` passes unvalidated `entry.type`. Needs server-side enforcement (RLS/RPC).
- [ ] **machine_bookings "own" policy never removed** — SQL fix needed.
- [ ] **wiki_rev_pointer NULL bypass on orphaned entries** — SQL fix needed.
- [ ] **Owner demotion via cm_manage RLS** — admin can demote/delete owner; add owner protection.
- [ ] **cm_leave / cm_manage_delete bypass cleanup RPCs** — direct DELETE on company_members skips rpc_leave_company cleanup (permissions orphaned).
- [ ] **`_provisioned_machine_ids()` no company scope** — `supabase/scalability_hardening.sql`: ghost permissions persist after company deletion / direct membership delete.
- [ ] **rpc_delete_company never cleans machine_permissions** — `supabase/company_rpcs.sql:119`.
- [ ] **Billing rates changeable by any admin, no role gating on numeric fields** — rpc_update_company allows any owner/admin; verify intent.
- [ ] **No check permission grantee is a company member** — machine/asset permission grants.
- [ ] **All tier gating client-side only** — tools/vehicles/equipment/consumables limits have no DB triggers (machines do).
- [ ] **`grant_upgrade` accepts arbitrary tier strings** — `supabase/apply_pending_upgrade_rpc.sql`.
- [ ] **`admin_delete_user` no server-side self-delete guard**; upgrade_grants not deleted with user.
- [ ] **`migrateLocalTools` upserts untrusted localStorage without scrubbing user_id.**
- [ ] **`updateProfile` accepts any userId** — `src/lib/db/users.js:64` (relies on RLS only).
- [ ] **`updateMemberRole` direct table write** — `src/lib/db/users.js:59`; should be RPC with role checks.
- [ ] **LIKE wildcard injection** — `src/lib/wiki.js:209, 226, 248/250`: `%`/`_` in make/model match everything. Also PostgREST `.or()` interpolation at wiki.js:288–297 protected only by distant regex — escape at the sink.
- [ ] **Stripe double-charge** — `supabase/functions/create-checkout/index.ts`: no active-subscription guard; price allowlist silently disabled if env vars missing.
- [ ] **Photos bucket world-readable forever** — no signed URLs/expiry; combined with wiki leak, URLs escape into public pages.

## P0 — Data loss / corruption

- [ ] **`dueDate` missing from toDb()/fromDb()** — `src/lib/db/transforms.js`: due dates silently dropped on every save; all DUE/OVERDUE badges permanently blank after reload.
- [ ] **13 outboard fields (`ob*`) missing from transforms** — entire outboard motor section discarded on every save.
- [ ] **`compressionRatio`, `totalLoadWatts`, `groundContactLength` missing from transforms** — silently discarded.
- [ ] **`lastServiceNotes` phantom field** — `src/components/tracker/ServiceReminders.jsx:69`: Mark Serviced notes never persisted (no toDb mapping).
- [ ] **`const isNew = true` hardcoded** — `src/components/machine/MachineForm.jsx:76`: editing an existing machine and saving immediately overwrites spec data with empty defaults. Fix: `!!existing`.
- [ ] **Whole-row last-write-wins races** — JobBoard handleFinish/handleManualLog/handleLogAndReset write entire machine row from stale prop; concurrent edits silently wipe logged billable sessions.
- [ ] **Service `completed_at` timezone corruption** — `src/components/ui/ServiceModal.jsx:12` + `helpers.js nowL()`: local naive string stored as UTC (AEST 2:30pm → 12:30am next day); editing seeds datetime-local with ISO+offset which renders blank.
- [ ] **Machine delete FK failure destroys photos first** — `src/lib/db/machines.js:67-82`: photos deleted before row delete; services rows not deleted first (FK violation likely); errors swallowed; machine resurrects with 404 photos.
- [ ] **delSvc destroys photos before DB delete** — `MachineCard.jsx:127-129`; deleteServiceApi swallows errors (`services.js:27`).
- [ ] **deleteClient destroys photos before DB delete** — `CustomersTab.jsx:155`; errors swallowed; client resurrects stripped of photos/links.
- [ ] **PhotoAdder remove() deletes from storage before form save** — Cancel can't undo; saved records left with broken images. Same in ServiceModal plug photo (`ServiceModal.jsx:26`).
- [ ] **PlugLog retake deletes old photo before new upload succeeds** — `PlugLog.jsx:17`: flaky network destroys both.
- [ ] **Legacy job_timer migration regenerates UUID every read** — `transforms.js:633`: timer identity unstable, corrupted on load-save cycles.
- [ ] **`migrateLocalInventory` ReferenceError** — `src/lib/db/inventory.js:155`: calls undefined `lsKey`; migration crashes every time.
- [ ] **upsertService update-then-insert reuses same PK** — `services.js:19`: RLS-hidden row → confusing duplicate-key error.
- [ ] **PartsSection.remove rolls back UI but not DB** — `JobBoard.jsx:536`: stock never returned; inventory drifts.
- [ ] **adjustStock swallows RPC errors, returns success shape** — `inventory.js:117`: JobBoard rollback paths are dead code; stocktake drifts silently.
- [ ] **rpc_update_company COALESCE treats empty string as value** — can't clear a field to NULL via RPC.
- [ ] **carb gasketPhotos orphaned on machine delete** — `machines.js:70` cleanup query misses `carb_spec.gasketPhotos`.
- [ ] **Photos uploaded at selection, orphaned on Cancel** — PhotoAdder uploads immediately; no consumer cleans up on unsaved close (all asset forms).
- [ ] **Promise.all multi-upload discards successes on one failure** — `PhotoAdder.jsx:22`: orphans + duplicate re-uploads.
- [ ] **saveSvc stale closure over svcs** — `MachineCard.jsx:122`: concurrent refresh clobbered.

## P1 — Money / billing correctness

- [ ] **exportInvoice re-bills already-invoiced sessions** — `JobBoard.jsx:112`: billStatus tracked but never consulted or updated; every invoice re-charges everything.
- [ ] **Countdown finish logs raw unclamped elapsed** — `JobBoard.jsx:800`: forgotten 1h countdown bills 10h.
- [ ] **Invoice rows don't sum to printed totals** — `JobBoard.jsx:259/117/118`: independent rounding of rows vs subtotal vs tax.
- [ ] **Invoice number fallback random + collision-prone** — `src/lib/db/invoices.js:8-11`: RPC errors swallowed, random 4-digit suffix, duplicates possible, no warning.
- [ ] **`qty 0` billed as qty 1** — `Number(p.qty) || 1` pattern in JobBoard (115, 154-156, 438-439, 677-678, 1024) and RevenueDashboard (91-92).
- [ ] **Storage revenue ignores custom tiers** — `RevenueDashboard.jsx:118` and `CustomersTab.jsx:72` call fee helpers without profile.storage_tiers; dashboard and client invoices disagree with what was actually charged.
- [ ] **minFee charged during free period** — `src/lib/helpers.js:95/83`: Math.max(minFee, …) applies with 0 billable days; customers appear to owe on day 0.
- [ ] **Dashboard counts never-invoiced work as revenue** — no billStatus filter in RevenueDashboard.
- [ ] **Custom date range from/to parsed inconsistently (UTC vs local)** — `RevenueDashboard.jsx:61, 88-89, 106-107`: same-day entries excluded east of UTC.
- [ ] **"This Week" is rolling 168h incl. future entries** — `RevenueDashboard.jsx:58`.
- [ ] **Parts with no timestamp excluded even from All Time** — `RevenueDashboard.jsx:82`.
- [ ] **`now` not in filtered useMemo deps** — `RevenueDashboard.jsx:53`: overnight-stale figures.
- [ ] **fmtMoney no NaN/negative/huge guards** — `helpers.js:18`: `$NaN`, `$-1,234.50`, `$1e+21`.
- [ ] **Invoice NaN masked as $0.00** (sweep 1-3).
- [ ] **hourly_rate=0 treated as unconfigured** (sweep 1-3).
- [ ] **`$120` wipes hourly rate** — parseFloat("$120") = NaN (settings input).
- [ ] **Double bookings possible** — `bookings.js:42`: no active-booking check, no unique constraint; then getActiveBooking (line 3) errors on maybeSingle → machine shows unbooked, fees stop accruing.
- [ ] **createBooking null user crash** — `bookings.js:48`: expired session → TypeError.
- [ ] **Booking list queries swallow errors → silent zero revenue** — `bookings.js:13/22/32`.
- [ ] **doCollect/toggleStorage no error handling** — `MachineCard.jsx:107/113`: failed collect keeps accruing fees with no feedback.
- [ ] **Due-date overdue check UTC-midnight skew** — `JobBoard.jsx:1021`; also ServiceReminders daysSince (`ServiceReminders.jsx:43`); also customFrom/dueDate parsing (sweep 1-3).
- [ ] **Month interval n*30 approximation** (sweep 1-3).

## P1 — Reliability / stuck states

- [ ] **No React error boundary** — any render error blank-screens the app.
- [ ] **ServiceModal save() locks forever on error** — `ServiceModal.jsx:31-37` + `MachineCard.saveSvc:119` no try/catch; failed save = disabled button, data unrecoverable. Same chain in ServiceReminders markServiced (`ServiceReminders.jsx:67`).
- [ ] **ServiceModal no completedAt validation** — empty datetime → Postgres cast error → locked modal.
- [ ] **ServiceModal plug upload empty catch{}** — `ServiceModal.jsx:28`: silent failure, entry saved without photo.
- [ ] **PlugLog doSave no in-flight guard, no error handling** — `PlugLog.jsx:18-23`: double-tap duplicates entries sharing one photo URL (deleting one breaks the other); success never invalidates MachineCard's cached service list.
- [ ] **EquipmentForm.save no try-catch** — permanent saving state on error.
- [ ] **upsertService no auth guard** — `services.js:11`: undefined user_id → cryptic RLS error (clients.js throws 'Not authenticated'; match that).
- [ ] **JobBoard mutation handlers no try/catch** — removeEntry, cycleBillStatus, saveNotes, MachineNotes save, updateStatus/updateRage (`JobBoard.jsx:298/305/320/1103/1160-1161`).
- [ ] **updateClient cover-photo failures silent** — `CustomersTab.jsx:131`.
- [ ] **exportClientInvoice window.open null crash** — `CustomersTab.jsx:109` (popup blocker); JobBoard guards, this doesn't.
- [ ] **handleFinish saves 0-second entries**; timer start has no optimistic lock; getElapsed NaN for legacy rows (sweep 1-3).
- [ ] **loadForSession race** — App.jsx first-flag; stale async overwrites post-signout state; prefsSynced not reset on signout; workshop_visible crashes if not array (sweep 1-3).
- [ ] **Pref-restore double-migration race** — `App.jsx:198`: billing poll setProfile re-enters !prefsSynced block; concurrent migrations + tab yank; missing deps.
- [ ] **Billing success banner polling stops at 16s with no error state** (sweep 1-3).
- [ ] **deleteUserPhotos caps at 1000 files, ignores errors** — `storage.js:43`.
- [ ] **deletePhoto fire-and-forget** — `storage.js:34`: RLS-rejected removals silently orphan files (esp. company members deleting owner-folder photos).
- [ ] **resizeToBlob unbounded height** — `storage.js:10`: tall images exceed 10MB server limit → misleading error. Client 50MB limit disagrees with server 10MB (`PhotoAdder.jsx:15`); no MIME validation; HEIC decode failure shows "check connection".
- [ ] **resizeToBlob leaks object URL on decode error** — `storage.js:17`.
- [ ] **getMachines no user_id filter** — `machines.js:11` (RLS-only); UPDATE calls on tools/vehicles/equipment/consumables missing user_id WHERE; unassignAsset no ownership check (sweep 4).
- [ ] **Double-deletion of photos in all asset types** (sweep 4).
- [ ] **Realtime channel UPDATE-only** — `App.jsx:282`: teammates never see INSERTs/DELETEs until reload.
- [ ] **StockItemTab numeric edge cases** — division by zero sellPrice, negatives bypass HTML min, parseFloat("Infinity"), comma-formatted numbers truncate ("1,500" → 1), doAdjust no stock floor.
- [ ] **Scientific notation accepted in year/spec fields** (MachineForm).
- [ ] **MachineForm overlay click loses all data, no warning.**
- [ ] **WikiAutocomplete stale fetch race** — `MachineForm.jsx:22`: old response overwrites newer, reopens dropdown after pick.
- [ ] **WikiHomePage search race** — `WikiHomePage.jsx:30`: out-of-order responses show wrong results; also searchWiki called with wrong arity (sweep 1-3).
- [ ] **WikiEntryPage slug fetch no cancellation** — `WikiEntryPage.jsx:38`: slow A clobbers B; view count fires for abandoned entries; stale slug race (sweep 1-3).
- [ ] **getMyCompany not imported in CompanySettings** — runtime crash.
- [ ] **cleanup-duplicates.mjs null crash on make.trim()** (script).
- [ ] **deleteServiceApi orphans photos on non-MachineCard paths** — `services.js:26`.
- [ ] **detectType returns 'Outboard' not 'Outboard Motor'** (sweep 1-3).

## P2 — Navigation / UX / polish

- [ ] **backGuard needs 3 presses to exit** — `src/lib/backGuard.js:55`: second press pops but doesn't exit; can be inescapable with no prior history.
- [ ] **MachineCard leaks history entry per open/close** — `MachineCard.jsx:76`: Back appears dead N times. (PhotoViewer does it right.)
- [ ] **backGuard hijacks legal pages** — `main.jsx:24`: /terms Back shows exit toast.
- [ ] **No 404 route; exact-match routing** — `App.jsx:436`: /terms/ or bogus paths render full app.
- [ ] **Legal pages missing onClose → no back button** — `App.jsx:437`.
- [ ] **Wiki slug not decodeURIComponent'd** — `WikiApp.jsx:11` (+ /m/:id in main.jsx:20): %20 links spuriously 404.
- [ ] **OAuth redirect drops ?template deep link** — `AuthScreen.jsx:48` + `App.jsx:256`: QR "add this machine" dies across login.
- [ ] **Hard-coded https://ratbench.net links** — `App.jsx:375`, WikiHomePage:97, WikiEntryPage:146, main.jsx:21 host check: breaks staging; logo click destroys SPA state in prod.
- [ ] **document.title never updated** — all routes titled "Rat Bench 🐀".
- [ ] **WikiApp doesn't pass session** — `WikiApp.jsx:25`: admin editing silently unavailable on wiki subdomain.
- [ ] **WikiHistoryPage no not-found handling** — `WikiHistoryPage.jsx:17`.
- [ ] **Tracker ?template RPC no .catch** — `Tracker.jsx:243`: network reject → unhandled rejection, state never cleared.
- [ ] **MachineCard guide effect missing showGuide dep** — `MachineCard.jsx:42`: tutorial arrow stuck.
- [ ] **MachineCard services/booking effects don't refetch on m.id change** — latent wrong-machine data (`MachineCard.jsx:61-70`); keyless overlay usage.
- [ ] **fmtDuration/fmtHrs drop seconds when h>0**; no negative guard; NaN from legacy t.elapsed (JobBoard/CustomersTab/RevenueDashboard).
- [ ] **Wiki search capped at 50 results** — `wiki.js`.
- [ ] **Chipper/Stump Grinder missing from ALL_TYPES; Jet Ski/PWC inconsistent; Jet Ski wrong section visibility** — `machineTypes.js`.
- [ ] **Array index keys on reorderable photo grids** — wrong reconciliation (sweep 4).
- [ ] **Asymmetric || null vs || "" transforms** — lastServiceDate/engineOil* fields; createdAt/updatedAt asymmetry in machine + service transforms.
