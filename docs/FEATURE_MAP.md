# RAT BENCH — Feature Map
> Living document. Update when features ship or queue changes.
> Legend: ✅ Done · 🔧 In progress · 📋 Queued · ❌ Blocked

---

## Dependency Stack (bottom = must exist first)

```
Supabase Auth
  └── profiles table
        └── tier system (gates.js)
              └── companies + company_members
                    └── machine_permissions
                    └── asset_permissions
                          └── vehicles / equipment / tools tables
              └── machines table (200+ cols)
                    └── services table
                    └── machine_bookings table
                    └── machine_permissions
              └── clients table
              └── inventory_items table
              └── wiki_entries + wiki_revisions tables
Stripe
  └── checkout / portal edge functions
        └── stripe-webhook edge function
              └── updates profiles.tier / companies.tier
```

---

## 1. Foundation

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| Supabase Auth (email/pass, anon guest) | ✅ | — | Free |
| Branded email templates (confirm signup + reset password) | ✅ | supabase/email-templates/ — paste into Supabase Auth → Email Templates | Free |
| OAuth: Google sign-in | ✅ | AuthScreen, Supabase Auth | Free |
| OAuth: Facebook sign-in | ❌ | Removed — Meta requires business verification | — |
| OAuth: Apple sign-in | 📋 | Queued — code removed for now, add back when needed | Free |
| Signup: confirm password + username validation | ✅ | AuthScreen | Free |
| Signup: live username availability check (✓/✗) + 🎲 dice generator | ✅ | AuthScreen, lib/username.js | Free |
| Auto-create profile on first login | ✅ | App.jsx loadForSession — uses get_my_profile() SECURITY DEFINER RPC first; if no row exists, calls create_my_profile() SECURITY DEFINER RPC (run supabase/create_profile_rpc.sql) which inserts the row bypassing RLS (profiles table has no INSERT policy — creation was always meant to go through SECURITY DEFINER paths); username comes from signup metadata or `user_{id6}` fallback; idempotent (returns existing row if already created by trigger); OnboardingScreen removed; profile load failure shows "Please refresh" error state; profileChecked resets on every loadForSession call so loading screen gates re-auth fetches | Free |
| Password reset | ✅ | auth | Free |
| Guest upgrade modal + profile banner | ✅ | auth — "Save Your Data" green banner shown at top of Profile settings page for anonymous users, above all other sections | Free |
| Profiles table + RLS | ✅ | auth.users — run supabase/org_and_profiles_rls.sql; SELECT restricted by column-level GRANT to safe public fields (id, display_name, username, units, default_status, tab_order, preferences, storage_policy_enabled, storage_tiers, tier, company_id, created_at) — sensitive fields (pending_code, stripe_customer_id, stripe_subscription_id) hidden from other users; get_my_profile() SECURITY DEFINER RPC returns full own-row data including sensitive fields; UPDATE own row only with column-level GRANT restricting writable columns to safe fields; tier/stripe/pending_* require SECURITY DEFINER path; same column-level protection on companies table | Free |
| Tier system (`gates.js`) — Free / Enthusiast $3.50wk / Business $10wk | ✅ | profiles.tier | All |
| Stripe Checkout (3 plans: Free / Enthusiast / Business) | ✅ | Stripe, profiles — create-checkout edge fn verifies JWT + confirms caller matches user_id; company billing verifies caller is owner or admin; success_url/cancel_url validated against ratbench.net allowlist; price_id validated against env vars; CORS restricted to ratbench.net origins; internal errors return generic 500 | All |
| Stripe webhook → tier update | ✅ | Stripe, profiles/companies — signature verified with constructEventAsync; PRICE_ENTHUSIAST → 'enthusiast', PRICE_PRO → 'business' (was 'team' which never unlocked org features gated on tier==='business'); unmapped price IDs log an error; subscription.updated checks sub.status — past_due/incomplete/unpaid/paused immediately downgrade to free; signature failure returns generic message (no err.message leak) | All |
| Billing portal (manage/cancel) | ✅ | Stripe customer ID — create-portal edge fn verifies JWT + caller identity; company billing restricted to owner/admin role (viewers/technicians blocked); 30s cooldown via _set_portal_session_at() RPC; CORS restricted to ratbench.net origins; internal errors return generic 500 (not err.message); run supabase/portal_rate_limit.sql | All |
| Announcements (in-app banners) | ✅ | profiles.tier — RLS: SELECT for all authenticated; INSERT/UPDATE/DELETE restricted to admin email only (run supabase/announcements_rls.sql) | All |
| Machines RLS (own + provisioned policies) | ✅ | scalability_hardening.sql + supabase/provisioned_update_checks.sql — run provisioned_update_checks.sql to add WITH CHECK to machines/vehicles/equipment/tools provisioned UPDATE policies (prevents provisioned users from changing user_id to steal asset ownership); also adds SECURITY DEFINER _machine/vehicle/equipment/tool_owner() helpers and asset_permissions.asset_type CHECK constraint | All |
| DB-level machine limit trigger (free=5, guest=3) | ✅ | scalability_hardening.sql + supabase/guest_limit_is_anonymous_fix.sql — enforce_machine_limit uses FOR UPDATE on profiles row; enforce_guest_machine_limit updated to read auth.users.is_anonymous (DB-managed, non-writable column) instead of raw_user_meta_data->>'is_anonymous' (user-writable via supabase.auth.updateUser, allowing bypass of the 3-machine guest cap) | Free |
| Critical DB indexes (machines, services, bookings, permissions) | ✅ | scalability_hardening.sql + supabase/missing_fk_indexes.sql — adds 9 missing indexes: company_id on company_members/asset_permissions/vehicles/equipment/tools/consumables/machine_permissions; wiki_revisions.entry_id; wiki_entries.created_by; without idx_company_members_company_id each _is_company_member/_is_company_admin call (fired on every policy evaluation) was a sequential scan | All |
| Checkout rate-limit (blocks duplicate Stripe sessions) | ✅ | create-checkout edge fn | All |
| Sentry error tracking | ✅ | VITE_SENTRY_DSN env var | All |
| Machine types: Snowmobile + Standalone Engine | ✅ | machineTypes.js — added Snowmobile (❄️, in MOTO array so gets drivetrain/suspension/brakes/electrics sections; excluded from showTyres since snowmobiles have tracks not tyres) and Standalone Engine (🔩, bare engines like Honda GX390/Kohler Command; shows engine/ignition/starter/fuel/PTO sections, hides drivetrain/suspension/brakes/tyres); both added to MACHINE_TYPES dropdown, TYPE_PH placeholders, and ALL_TYPES; wikipedia-import.mjs detectType() and all BRANDS defaultType values updated to use correct strings matching constants (ATV→Quad Bike, Jet Ski→Jet Ski / PWC, Outboard→Outboard Motor, Engine→Standalone Engine, Tiller→Tiller / Cultivator) | All |
| Super admins | ✅ | Two hardcoded super admins: nathan.gentil.ai@gmail.com + nathan.gentil@gmail.com — all server-side checks use `auth.email() NOT IN (...)` / `IN (...)`; client-side uses `ADMIN_EMAILS.includes()` array in AdminPanel, SettingsPage, WikiEntryPage; re-run all admin SQL files to apply to DB | Admin only |
| Admin panel analytics (users, active, machines, signups trend) | ✅ | AdminPanel.jsx OverviewTab + admin_get_stats() RPC — run supabase/admin_get_stats.sql to update; server-side auth.email() check blocks non-admin calls; GRANT EXECUTE TO authenticated added (was missing, caused silent 403 failures); VITE_ADMIN_EMAIL fallback corrected to nathan.gentil.ai@gmail.com to match SQL (all three client files: AdminPanel, SettingsPage, WikiEntryPage) | Admin only |
| Admin: list / search users | ✅ | AdminPanel.jsx UsersTab + admin_list_users(p_search, p_limit, p_offset) RPC — run supabase/admin_rpcs.sql; returns id, email, display_name, username, tier, created_at, last_sign_in_at, machine_count; server-side auth.email() check | Admin only |
| Admin: set user tier | ✅ | AdminPanel.jsx UsersTab tier select + admin_set_tier(p_email, p_tier) RPC — run supabase/admin_rpcs.sql; server-side auth.email() check; p_tier validated against allowlist (free/enthusiast/team/business) — arbitrary strings rejected; audited to admin_audit_log | Admin only |
| Admin: deactivate user (reset to free) | ✅ | AdminPanel.jsx UsersTab Deactivate button + admin_deactivate_user(p_email) RPC — run supabase/admin_rpcs.sql; clears stripe_subscription_id; audited | Admin only |
| Admin: hard-delete user from Supabase + all data + storage photos | ✅ | AdminPanel.jsx UsersTab Delete button + admin_delete_user() RPC + deleteUserPhotos() — run supabase/wiki_nullable_author_cols.sql THEN supabase/admin_delete_user.sql AND supabase/admin_storage_policy.sql — cleans: company_members, machine_permissions, asset_permissions, services, machine_bookings, machines, clients, inventory_items, vehicles, equipment, tools, consumables, asset_assignments, profiles, auth.users; wiki content is PRESERVED — created_by/edited_by/user_id NULLed instead of deleted (requires wiki_nullable_author_cols.sql run first); revision history shows "username · user retired" in grey for orphaned contributions; if sole company owner, company tier reset to free; server-side auth.email() admin guard | Admin only |
| Admin: delete wiki entries by a specific user | ✅ | AdminPanel.jsx UsersTab Del Wiki button + admin_delete_user_wiki(uuid) RPC — run supabase/admin_delete_user_wiki.sql; server-side auth.email() check prevents any authenticated user from calling it; wiki deletion order: contributions+revisions on user's entries first (prevents FK violation when other contributors have rows referencing those entries), then entries, then user's own revisions/contributions on other entries | Admin only |
| Admin: delete individual wiki entry | ✅ | WikiEntryPage — admin delete button visible when VITE_ADMIN_EMAIL matches; deleteWikiEntry() manually deletes contributions + revisions before entry | Admin only |
| Admin: bulk-delete all wiki entries | ✅ | admin_delete_all_wiki() RPC — run supabase/admin_delete_wiki.sql; deletes contributions, revisions, and entries in order; server-side auth.email() check | Admin only |
| Admin audit log | ✅ | admin_audit_log table — run supabase/admin_tables_rls.sql; append-only: admin has SELECT only (no UPDATE/DELETE policy — prevents admin from erasing their own audit trail); SECURITY DEFINER RPCs bypass RLS for INSERT writes; AuditTab reads last 200 entries | Admin only |
| Feature flags table | ✅ | feature_flags table — run supabase/admin_tables_rls.sql; admin can create/toggle/delete; all authenticated users can SELECT (for client-side gating); managed from AdminPanel FlagsTab | Admin only |
| Admin: storage photo cleanup on user delete | ✅ | is_admin_user() storage policy — run supabase/admin_storage_policy.sql; checks auth.email() = admin email; GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated added (without it, storage policy evaluation fails for authenticated role and admin photo deletions silently no-op on other users' folders) | Admin only |
| upgrade_grants table + RLS | ✅ | Stores admin-issued tier grants (email + tier + expiry); run supabase/upgrade_grants_rls.sql — admin-only SELECT/INSERT/UPDATE/DELETE; without RLS any authenticated user could read all grant records | Admin only |
| Upgrade grant RPCs (grant / revoke / apply) | ✅ | run supabase/apply_pending_upgrade_rpc.sql — creates upgrade_grants table + pending_* columns on profiles; grant_upgrade(email, tier): admin-only, generates code, sets pending_code/pending_tier/pending_code_expires_at on target profile; revoke_upgrade(email): admin-only, expires grant and clears pending columns; apply_pending_upgrade(): called by user from ProfileSettings, validates code; uses profiles FOR UPDATE lock + atomic UPDATE upgrade_grants SET redeemed_at = now() RETURNING id to claim the grant in a single statement (prevents TOCTOU where two concurrent callers could both pass the redeemed_at IS NULL check); upgrades profile tier, audits | Admin + All |
| Photo viewer: X button + Android back button closes viewer | ✅ | PhotoViewer.jsx — manualClose() pattern (stopPropagation on X prevents double history.back), 52px tap target | All |
| Machine card: Android back button collapses expanded card | ✅ | MachineCard.jsx — pushState({ cardOpen: id }) on expand, popstate listener collapses it | All |
| Android PWA: "Press back again to exit" toast | ✅ | src/lib/backGuard.js — installBackGuard() called in main.jsx before React renders; 2 s window | All |
| Wipe all base64 photos from DB | ✅ | supabase/wipe_photos.sql — run once in SQL Editor (irreversible) | Admin only |
| Photo storage — Supabase Storage bucket | ✅ | supabase/create_photos_bucket.sql + src/lib/storage.js — run SQL first, then deploy; PhotoAdder rejects files over 50MB client-side before canvas resize attempt | All |
| Photo cleanup on asset delete | ✅ | deletePhoto() in storage.js called when deleting: machines (deleteMachineApi — fetches main+port photos from machines table + plug/job photos from services table before row delete), vehicles (fetches photos + service_log plugPhoto/jobPhotos), equipment (same), tools (same), clients (deleteClientApi now fetches photos column before row delete), parts (fetches payload.photos before row delete), consumables (deleteConsumable fetches photos column before row delete) | All |
| Photo cleanup on service log entry delete | ✅ | MachineCard delSvc: collects plugPhoto + jobPhotos from svc state before deleteServiceApi; VehiclesTab removeSvcEntry: same (vehicle entries use ServiceModal which adds photos); tools/equipment service log entries are inline-only (no photos, no cleanup needed) | All |
| Preconnect hints (Fonts + Supabase dns-prefetch) | ✅ | index.html | All |
| Non-blocking announcements fetch (deferred after first paint) | ✅ | App.jsx IIFE after setInitializing — tier filter uses effectiveTier(profileData, companyData) so company-billed users see announcements targeted at their effective tier (previously used profile.tier alone which is 'free' for company members) | All |
| Auto-retry on total load failure + friendly slow-connection message | ✅ | App.jsx loadForSession — if 4+ parallel fetches fail, waits 2 s and retries once silently; loading screen shows "Taking a bit longer than usual… slow connection — giving it another go" during the wait instead of alarming the user | All |
| Service worker / PWA static asset cache (repeat-visit perf) | ✅ | vite-plugin-pwa, dist/sw.js | All |
| Shared `UpgradeBanner` component (green box, label, Upgrade → button) | ✅ | src/components/ui/UpgradeBanner.jsx — used in JobBoard, ServiceReminders, VehiclesTab, EquipmentTab, ToolsTab, StockItemTab, WikiTab | All |

---

## 2. Machine Tracker (core)

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machines table (200+ columns, RLS) | ✅ | profiles, companies | Free |
| Create / edit / delete machine | ✅ | machines table, transforms.js — delete shows in-app confirmation modal listing all data lost (service history, time logs, photos, storage bookings, client links, parts records), notes wiki entries persist, warns if timer running; "Delete Forever" required to proceed | Free |
| First-run arrow guide (3-step tutorial: arrow → + Add · arrow → first card · in-card button key) | ✅ | Tracker.jsx GuideStep1/GuideStep2 + MachineCard showGuide prop — curved hand-drawn orange SVG arrows with pulsing glow; step 3 annotates each button (Edit Machine, PDF, Share, Layout, + LOG) inside the expanded card; dismissed state stored in profiles.preferences | Free |
| First-run tab guides (all tabs) | ✅ | TabGuide.jsx shared component — two variants: "add" (right-aligned, arrow up-right toward + Add button) and "info" (centered, arrow down toward content); dismissed state stored per-key in profiles.preferences (rat_tut_jobs · rat_tut_search · rat_tut_revenue · rat_tut_clients etc.); same orange glow SVG arrow style as Tracker guide | Free |
| Job card first-use inline guide | ✅ | JobBoard.jsx JobCard — green tip block shown on first expand (profiles.preferences.rat_tut_job_card); explains Notes / Timer / Parts / Status buttons; "got it" dismiss | Free |
| Share machine link (🔗 copies /m/:id URL, 2-sec ✓ feedback) | ✅ | MachineCard.jsx copied state + clipboard API | Free |
| Public machine page (ratbench.net/m/:id, no auth required) | ✅ | PublicMachinePage.jsx + main.jsx route check + get_public_machine() RPC — run supabase/public_machine.sql; exposes only: id, name, type, make, model, year, last_service_date, last_service_odo, photos (time_log and notes are intentionally excluded); shows cover photo hero banner; accent-coloured QR code; "Add this machine" deep-link pre-fills Add Machine form | Free |
| Machine form (all 200+ spec fields) | ✅ | machines, machineTypes constants | Free |
| Machine form sections guide (first-run callout above section list) | ✅ | MachineForm.jsx showFormGuide state — "more specs = more calcs" tip (bore+stroke → compression ratio & piston speed; lighting entries → charge load, all auto); lists 8 key sections with curved orange arrows; Service Intervals highlighted; prominent orange "got it ✓" dismiss button; dismissed state in profiles.preferences.rat_form_tut; auto-dismisses on first save | Free |
| First-add field glow (Type + Name) | ✅ | MachineForm.jsx firstAdd flag (showFormGuide && !existing) — pulsing orange box-shadow on Type select and Name input; .field-guide CSS class in index.css; clears after guide dismissed | Free |
| List / grid / compact / photo views | ✅ | machines, MachineTile, MachineCard, MachineRow, MachinePhotoRow — four modes cycled by one button (⊞ → ≡ → ▣ → ☰ → ⊞): photo list (**default**), 2×2 grid, compact list (MachineRow: icon + name + make/model/type + full tileFields badges + service/due/client/hours indicators), photo list (MachinePhotoRow: 64×64 thumbnail left + same info right, falls back to type emoji if no photo), standard list (poster cards); tapping any row/tile opens full MachineCard pre-expanded in a full-screen overlay with orange ✕ Close | Free |
| Search, sort, filter by status | ✅ | machines | Free |
| Drag-to-reorder | ✅ | machines | Free |
| Machine limit enforcement (5 free, 3 guest) | ✅ | gates.js, machines count | Free |
| Configurable tile fields + colours | ✅ | machines, ui.js constants | Free |
| Configurable expand sections | ✅ | machines, ui.js constants | Free |
| PDF spec sheet export | ✅ | machines, jspdf | Free |
| Machine → client linking | ✅ | machines, clients table | Enthusiast+ |
| Machine → company tagging | ✅ | machines, companies | Business |
| Real-time sync (org machines) | ✅ | Supabase channel, company_id | Business |
| "Shared" badge on provisioned machines | ✅ | machine_permissions | Business |
| Wiki submission from machine | ✅ | wiki_entries, machines | Enthusiast+ |
| Rage rating (☠️ skulls) | ✅ | machines.rage | Free |
| Custom sections (user-defined spec blocks) | ✅ | machines.custom_sections (jsonb) | Free |
| Chipper / Stump Grinder spec fields | ✅ | machines, chipper_spec (jsonb) | Free |
| Tracked machine spec fields | ✅ | machines, tracked_* columns | Free |
| Outboard motor spec fields | ✅ | machines, ob_* columns | Free |
| Auto-calc: bore/stroke ratio | ✅ | machines.crank_stroke, bore | Free |
| Auto-calc: tyre size parser | ✅ | machines.tyre_front/rear | Free |
| Auto-calc: final drive + top speed | ✅ | machines.sprockets, gearing | Free |
| Auto-calc: blade tip speed | ✅ | machines.blade_length, wot_rpm | Free |
| Auto-calc: compression → octane | ✅ | machines.compression | Free |
| Auto-calc: hydraulic ram force/volume | ✅ | machines.hyd_rams (jsonb) | Free |
| Auto-calc: ground pressure (tracked) | ✅ | machines tracked fields | Free |
| Auto-calc: undercarriage wear % | ✅ | machines.track_pitch, link_count | Free |
| Auto-calc: electrical (lighting, wire drop) | ✅ | machines.lighting (jsonb) | Free |
| Auto-calc: battery energy / CCW | ✅ | machines.batteries (jsonb) | Free |
| Auto-calc: generator amps / max motor | ✅ | machines.gen_watts, gen_voltage | Free |
| Auto-calc: 2T mix oil quantity | ✅ | machines.mix_ratio, tank_capacity | Free |
| Auto-calc: pressure washer cleaning units | ✅ | machines.pump_psi, flow | Free |
| Auto-calc: net charge rate | ✅ | machines.charge_amps, lighting load | Free |
| Auto-calc: mean piston speed | ✅ | machines.crank_stroke, wot_rpm | Free |
| Auto-calc: rod ratio | ✅ | machines.conrod_length, stroke | Free |
| Auto-calc: suspension spring rate check | ✅ | machines.fork_type, spring_rate | Free |

---

## 3. Machine Provisioning (ACL)

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machine_permissions table + RLS | ✅ | machines, company_members | Business |
| getMachines() returns provisioned machines | ✅ | machine_permissions | Business |
| Provisioning panel in CompanySettings | ✅ | machine_permissions, company_members | Business |
| Grant View / Grant Edit / Revoke per member | ✅ | machine_permissions | Business |
| Read-only machine card for View-only members | ✅ | machine_permissions, can_edit flag | Business |

---

## 4. Service Tracking

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| services table + RLS | ✅ | machines — run supabase/services_rls.sql then supabase/services_rls_hardening.sql; policies: full access for service creator or machine owner, read-only for provisioned members; services_own WITH CHECK now verifies machine ownership on INSERT/UPDATE (prevents attaching a service to a machine the user doesn't own/isn't provisioned on); _service_owner() SECURITY DEFINER helper prevents RLS recursion; services_provisioned_update policy grants edit rights to provisioned team members; upsertService split into insert/update paths — user_id stripped from UPDATE; getServices() capped at .limit(500) | Free |
| Log service entry (date, types, notes) | ✅ | services table | Free |
| Spark plug photo log | ✅ | services, photos (base64) | Free |
| Job photos per service | ✅ | services, photos | Free |
| Oil change interval (hrs or months) | ✅ | machines.oil_change_interval | Free |
| Major service interval (hrs or months) | ✅ | machines.major_service_interval | Free |
| Overdue / due-soon badge in tab bar | ✅ | getMachineServiceStatus() helper | Free |
| Progress bar (green → red) | ✅ | service intervals, last service date | Free |
| Service history timeline on machine card | ✅ | services table | Free |
| Mark Serviced auto-logs to service history (3-tap flow from reminder) | ✅ | ServiceReminders.jsx markServiced calls upsertService with General Service entry | Free |

---

## 5. Storage Policy

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machine_bookings table + RLS | ✅ | machines, auth.users — own policy in storage_migration.sql; run supabase/machine_bookings_provisioned.sql (provisioned SELECT) and supabase/machine_bookings_ownership.sql (adds WITH CHECK on INSERT/UPDATE enforcing that the booked machine is owned by or provisioned to the booking user — prevents booking injection onto arbitrary machines by UUID) | Enthusiast+ |
| Global enable toggle (`profiles.storage_policy_enabled`) | ✅ | profiles — run supabase/storage_policy_tier_trigger.sql; BEFORE UPDATE trigger rejects writes to storage_policy_enabled or storage_tiers if the profile's current tier is free (prevents free-tier bypass via direct API call) | Enthusiast+ |
| Storage tiers (Bench/Small/Medium/Large/Extra Large/Custom) | ✅ | storageTiers.js DEFAULT_STORAGE_TIERS | Enthusiast+ |
| Configurable tier rates (freeDays/dailyRate/escalateDays/minFee) | ✅ | profiles.storage_tiers JSONB, getTiers(), StorageSettings inline edit — server-side tier enforced by trg_storage_policy_tier trigger | Enthusiast+ |
| Book In — create a booking with tier + received date; touch-friendly: full-width 56px button with large 📥 emoji, single-column form with 48px inputs, 22px checkbox with full-row tap target, stacked action buttons | ✅ | machine_bookings, MachineCard | Enthusiast+ |
| Per-visit storage toggle (charge/pause billing) | ✅ | machine_bookings.storage_enabled | Enthusiast+ |
| Mark Collected — close booking, stop accrual | ✅ | collectMachine(), MachineCard | Enthusiast+ |
| Tile badge: free days remaining (green) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| Tile badge: accrued fees (orange) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| Tile badge: ⚠ FOR SALE escalation (red + glow) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| ServiceReminders: escalation + billing alerts | ✅ | getAllActiveBookings(), getStorageStatus() | Enthusiast+ |
| ServiceReminders: consumable stock alerts (LOW / OUT / OVER) | ✅ | getConsumables(), ServiceReminders.jsx | Free |
| Invoice: storage fees line item | ✅ | getActiveBooking(), exportClientInvoice() | Enthusiast+ |
| Billing & Storage tab (billing rates section at top requires org — shows org-required prompt otherwise; storage toggle + editable tier table requires Enthusiast+; tab renamed from "Storage") | ✅ | StorageSettings.jsx, SettingsPage — billing rates (hourlyRate/taxRate/taxLabel) moved here from CompanySettings with own Save Rates button; setCompany passed through for live update | Enthusiast+ (storage) / Any tier with org (billing rates) |
| Booking history per machine | ✅ | getBookingHistory(), machine_bookings — capped at .limit(200) | Enthusiast+ |
| Custom daily rate override per visit | ✅ | machine_bookings.storage_fee_override | Enthusiast+ |
| Storage revenue in Revenue Dashboard | ✅ | getClosedBookings(), getClosedBookingFee(), RevenueDashboard — getClosedBookings and getAllActiveBookings both capped at .limit(500) (previously unbounded) | Enthusiast+ |
| Storage revenue card (realized, per period) | ✅ | filteredBookings, storageRev | Enthusiast+ |
| Storage revenue per-machine breakdown | ✅ | storageByMachineId, byMachine | Enthusiast+ |
| Storage included in Gross Profit total | ✅ | grossProfit = labour + parts + storage − cost | Enthusiast+ |

---

## 6. Job Board & Time Tracking

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| Jobs tab: shows first 3 machines only on free tier (FREE_LIMIT=3) | ✅ | JobBoard.jsx FREE_LIMIT | Free (limit) |
| Job timer (start / stop / pause) | ✅ | machines.job_timer (jsonb) — saving state disables Pause/Resume/Reset/Finish buttons during async save to prevent double-fire | Free |
| Duration display shows seconds | ✅ | fmtDuration / fmtHrs in JobBoard, CustomersTab, RevenueDashboard — "27s" under 1 min, "2m 30s" for mixed, "3m" when exact | Free |
| Multiple timers per machine | ✅ | machines.job_timer array | Free |
| Timer sync: lock when another member running | ✅ | job_timer.startedBy, Realtime | Business |
| Time log (save sessions with label + notes) | ✅ | machines.time_log (jsonb) | Free |
| Running timer badge in Jobs tab | ✅ | machines.job_timer status | Free |
| Invoice generation (labour + parts) | ✅ | time_log, inventory, company rates — sequential invoice numbers via next_invoice_number RPC (run supabase/invoice_number_rpc.sql; stores per-year counter in profiles.preferences with FOR UPDATE); falls back to year+random if RPC unavailable | Free |
| Parts markup on invoice | ✅ | inventory buy/sell price | Free |
| Tax calculation on invoice | ✅ | companies.tax_rate, tax_label | Business |
| Invoice number auto-increment | ✅ | invoices.js — next_invoice_number RPC (DB-only, no local fallback) | Free |
| HTML invoice export | ✅ | time_log, parts, company details — company logo sanitised via safeImgSrc() (only data:image/ and https:// URLs allowed in img src; blocks javascript: and data:text/html XSS vectors) | Free |
| Collapsed/expanded job card layout — poster style (full-width hero photo 170px with bottom fade gradient to card background, dark emoji placeholder when no photo, icon+name+source/make/model+type below, priority/client/due badges + stats row below info panel) | ✅ | JobBoard JobCard — replaced horizontal thumbnail layout with vertical poster layout matching MachineCard | Free |
| Common jobs autocomplete | ✅ | COMMON_JOBS constant | Free |
| Barcode scanner (keyboard detection) | ✅ | inventory items | Free |
| Stock auto-deduct on part use (parts) | ✅ | adjustStock(), inventory — machineSaved flag: if machine saves but stock adjustment fails, machine is rolled back in DB to keep parts list and stock counts consistent | Free |
| Stock auto-deduct on consumable use | ✅ | adjustConsumableQty(), consumables — same machineSaved rollback guard as parts | Free |
| Jobs picker: Parts tab + Consumables tab | ✅ | inventory + consumables, sourceType on entries | Free |
| Running cost total per job (parts + labour) | ✅ | machines.parts sellPrice, company.hourly_rate | Free |
| Cost Summary row in expanded job card | ✅ | partsTotal + labourTotal = grandTotal | Free |

---

## 7. Revenue Dashboard

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| Revenue totals (labour, parts & consumables, profit) | ✅ | time_log, inventory, consumables, company.hourly_rate | Enthusiast+ |
| Date filters (week / month / all / custom) | ✅ | time_log.completedAt, machine.parts[].usedAt | Enthusiast+ |
| Per-machine breakdown | ✅ | time_log, machines | Enthusiast+ |
| Tax deduction display | ✅ | companies.tax_rate | Business |
| Currency formatting | ✅ | companies.currency | Business |

---

## 8. Parts & Inventory

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| inventory_items table + RLS | ✅ | profiles — run supabase/inventory_items_rls.sql then supabase/inventory_items_provisioned.sql; owner has full access; provisioned SELECT and UPDATE policies (with ownership-theft guard via _inventory_item_owner() SECURITY DEFINER helper) allow team members with asset_permissions entries for asset_type='part' to read and edit shared parts; getInventory() capped at .limit(1000) | Free |
| Create / edit / delete parts | ✅ | inventory_items | Free |
| Buy price / sell price / stock qty | ✅ | inventory_items.payload (jsonb) | Free |
| Min par / max par levels with LOW/OVER badges | ✅ | inventory_items.payload minQuantity/maxQuantity | Free |
| 20 workshop-specific part categories (Tyres, Filters, Spark Plugs, Fasteners, Engine Components, etc.) | ✅ | partsTypes.js, StockItemTab typeConfig | Free |
| Category-specific spec fields per part type (gap/heat range for plugs, pitch/gauge for chains, ET/PCD for wheels, etc.) | ✅ | partsTypes.js PART_CATEGORY_SPECS | Free |
| Part category groups filter bar (Tyres & Wheels, Engine, Fuel & Induction, Ignition, Drive Train, etc.) | ✅ | partsTypes.js PART_CATEGORY_GROUPS | Free |
| QR code label generation + print | ✅ | inventory_items, qrcode library | Free |
| Barcode scanner input | ✅ | keyboard detection | Free |
| Stock adjustment (use / restock) | ✅ | inventory_items.payload — adjustStock() calls adjust_inventory_stock() RPC (run supabase/adjust_stock_rpcs.sql); atomic single-statement UPDATE eliminates read-modify-write race condition under concurrent use by multiple technicians | Free |
| Machine parts list (per-machine) | ✅ | machines.parts (jsonb) | Free |
| localStorage → Supabase migration | ✅ | inventory_items | Free |
| Photos per part (stored in payload JSONB) | ✅ | inventory_items.payload.photos | Free |
| Cover photo selection (☆ Cover) for parts | ✅ | PartsTab | Free |
| Shared UI (StockItemTab) with Consumables tab | ✅ | StockItemTab.jsx, tableType prop | Free |
| Org provisioning for parts | ✅ | asset_permissions with asset_type='part' — inventory.js permissions functions corrected from 'consumable' to 'part' (namespace collision with consumables table fixed) | Business |

---

## 9. Clients & Invoicing

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| clients table + RLS | ✅ | profiles, companies — user_id FK has ON DELETE CASCADE (run supabase/clients_fk_cascade.sql); upsertClient split into insert/update paths, user_id stripped from UPDATE; getClients() capped at .limit(500) | Enthusiast+ |
| Create / edit / delete clients | ✅ | clients table | Enthusiast+ |
| Photos per client (clients.photos jsonb column) | ✅ | clients table, add_photos_to_clients.sql | Enthusiast+ |
| Cover photo selection (☆ Cover) for clients | ✅ | CustomersTab | Enthusiast+ |
| Link machines to clients | ✅ | machines.client_id | Enthusiast+ |
| Per-client invoice (all linked machines) | ✅ | time_log, parts, clients | Enthusiast+ |
| HTML invoice export with company header | ✅ | clients, companies, time_log | Enthusiast+ |
| localStorage → Supabase migration | ✅ | clients table | — |

---

## 10. Asset Tracking (Vehicles / Equipment / Tools)

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| asset_permissions table + RLS | ✅ | auth.users, company_members — run supabase/provisioned_update_checks.sql to enforce CHECK constraint on asset_type (valid: vehicle/equipment/tool/consumable/part); provisioned UPDATE policies on all asset tables now have WITH CHECK to prevent ownership theft | Business |
| **vehicles** table + RLS | ✅ | asset_permissions | Free |
| Vehicles tab: CRUD + service log + photos | ✅ | vehicles table | Free (1 limit) |
| Vehicle service log: full ServiceModal (types, datetime, plug photo, job photos, edit) | ✅ | ServiceModal, VehiclesTab — saving guard prevents duplicate entries on double-click; plug photo replace uploads new first then deletes old (safe on network failure); saveSvcEntry wrapped in try/catch — alerts on failure and keeps modal open; update() rethrows so callers detect DB failures | Free |
| Sort modal + list/grid view toggle (Vehicles) | ✅ | VehiclesTab, AssetTile | Free |
| **equipment** table + RLS | ✅ | asset_permissions | Free |
| Equipment tab: CRUD + service log + photos | ✅ | equipment table | Free (5 limit) |
| Sort modal + list/grid view toggle (Equipment) | ✅ | EquipmentTab, AssetTile | Free |
| **tools** table + RLS | ✅ | asset_permissions | Free |
| Tools tab: CRUD + warranty + loan tracking | ✅ | tools table | Free (5 limit) |
| Sort modal + list/grid view toggle (Tools) | ✅ | ToolsTab, AssetTile | Free |
| localStorage → Supabase migration (tools) | ✅ | tools table | — |
| Free-tier item limits (vehicles=1, tools=5, equipment=5, consumables=5, parts=5) | ✅ | gates.js TIERS.free + StockItemTab FREE_LIMIT | Free |
| Upgrade banner at limit | ✅ | atAssetLimit() | Free |
| Org provisioning (grant/revoke per member) | ✅ | asset_permissions, CompanySettings | Business |
| **asset_assignments** table + RLS (replaces vehicle_assignments for cross-type) | ✅ | asset_assignments_migration.sql; run supabase/asset_assignments_add_member.sql to expand child_type CHECK to include 'member' and 'part'; getAssignedTo() and getAssignedIn() capped at .limit(200) | Free |
| Vehicle loadout: assign tools/equipment/consumables/parts to a vehicle | ✅ | asset_assignments, LoadoutSection — assignment only from VehiclesTab; LoadoutSection removed from Tools/Equipment/StockItemTab | Free |
| Vehicle loadout item limit (free=5, paid=unlimited) | ✅ | LoadoutSection maxItems prop — VehiclesTab passes 5 for free tier; shows n/5 count and disables + Assign at limit with upgrade nudge | Free |
| Unassign items from vehicle loadout | ✅ | unassignAsset(), LoadoutSection | Free |
| **consumables** table + RLS | ✅ | asset_permissions | Free |
| Consumables tab: CRUD + qty tracking + stock alerts | ✅ | consumables table | Free (10 limit) |
| Sort modal + list/grid view toggle (Consumables) | ✅ | ConsumablesTab, AssetTile | Free |
| 80+ common presets (oils, fuels, coolants, welding, abrasives…) | ✅ | consumableTypes.js COMMON_CONSUMABLES | Free |
| Category-specific spec fields (viscosity, octane, DOT, ISO grade…) | ✅ | consumableTypes.js CATEGORY_SPECS | Free |
| ± stock adjustment inline on card | ✅ | adjustConsumableQty() calls adjust_consumable_qty() RPC (run supabase/adjust_stock_rpcs.sql); atomic UPDATE eliminates read-modify-write race; getConsumables() capped at .limit(1000) | Free |
| Cover photo selection (☆ Cover sets card thumbnail) | ✅ | VehiclesTab, ToolsTab, EquipmentTab, ConsumablesTab, MachineCard | Free |
| Photos for consumables (add via form, thumbnail in card, cover selection) | ✅ | ConsumablesTab, consumables table photos column | Free |
| Machine card collapsed header — poster style (full-width hero photo 170px with bottom fade gradient to card background, dark emoji placeholder when no photo, icon+name+make/model/year+type below, badges below info panel) | ✅ | MachineCard — replaced horizontal thumbnail+info layout with vertical poster layout | Free |
| Low-stock / out-of-stock badge + overstock badge | ✅ | qtyLabel(), min_quantity / max_quantity thresholds | Free |
| Configurable min par (reorder point) and max par (ceiling) | ✅ | consumables.min_quantity, consumables.max_quantity | Free |
| Buy price / sell price / supplier / part number / location | ✅ | consumables.buy_price, sell_price, supplier, part_number, location | Free |
| Shared UI (StockItemTab) with Parts tab | ✅ | StockItemTab.jsx, tableType="consumable" | Free |
| Org provisioning for consumables | ✅ | asset_permissions, CompanySettings — provisioned UPDATE policy now has WITH CHECK (user_id = _consumable_owner(id)) via supabase/provisioned_update_checks.sql; prevents provisioned users from changing user_id to steal consumable ownership | Business |
| Assign org member to vehicle (VehicleMemberSection) | ✅ | getCompanyMembers(), assignAsset child_type='member', company prop — run supabase/asset_assignments_add_member.sql to enable (original CHECK constraint blocked 'member' inserts) | Business |

---

## 11. Team & Organisation

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| companies table + RLS | ✅ | profiles — run supabase/org_and_profiles_rls.sql; members read; admins update (column-level REVOKE/GRANT blocks direct writes to tier/stripe_customer_id/stripe_subscription_id — only SECURITY DEFINER edge functions can write those); _is_company_member / _is_company_admin SECURITY DEFINER helpers avoid asset_permissions recursion; direct INSERT policy removed (rpc_create_company is SECURITY DEFINER and handles both the company row and company_members seeding atomically — open INSERT policy would create ownerless companies) | Business |
| Create / edit company | ✅ | companies — run supabase/company_rpcs.sql then supabase/company_columns_restrict.sql; rpc_create_company SECURITY DEFINER creates row + seeds owner; REVOKE SELECT on companies restricts authenticated reads to safe columns (excludes stripe_customer_id/stripe_subscription_id); get_my_company(p_company_id) SECURITY DEFINER RPC returns full row for company members; getMyCompany() in users.js uses RPC instead of select("*") | Business |
| Invite code join flow | ✅ | companies.invite_code — run supabase/company_rpcs.sql (defines join_company_by_invite SECURITY DEFINER: matches invite_code, inserts member as 'viewer' role, links profile; blocks joining if already a member of a different org — must leave first; original 'member' role violated the role CHECK constraint) | Business |
| company_members table | ✅ | companies, profiles — RLS: members read own company list; admins manage; users can leave; run supabase/org_and_profiles_rls.sql then supabase/company_members_no_direct_insert.sql; cm_manage split into cm_manage_update + cm_manage_delete (no INSERT) — all member additions must go through join_company_by_invite SECURITY DEFINER RPC (direct INSERT allowed a compromised admin to add arbitrary users at any role, bypassing the invite flow's role='viewer' enforcement); CHECK constraint enforces valid role values at DB level | Business |
| Roles: owner / admin / technician / viewer | ✅ | company_members.role — DB CHECK constraint enforces valid values; role='owner' cannot be set via direct UPDATE (requires SECURITY DEFINER RPC) | Business |
| Edit member roles | ✅ | updateMemberRole() — UsersTab derives isOwner and isMemberOwner from company_members.role in the loaded members list (company.owner_id column never existed; using it made isOwner always false, locking the owner out of all management actions and exposing the owner's role to change) | Business |
| Remove member | ✅ | rpc_remove_member() — run supabase/delete_cascade_fixes.sql; verifies caller is owner/admin; blocks removing the company owner (would orphan company permanently); cleans machine_permissions, asset_permissions, vehicle crew assignments; uuid columns in DELETE queries use direct uuid comparison (::text casts removed — casts prevented index use) | Business |
| Leave company (self) | ✅ | rpc_leave_company(p_company_id) — run supabase/rpc_leave_company.sql; cleans machine_permissions and asset_permissions for that company before removing the company_members row and clearing profiles.company_id; previously leaveCompany only deleted the members row, leaving orphaned provisioned access; owner is blocked from leaving (must transfer ownership or delete company first) | Business |
| Delete company | ✅ | deleteCompany() → rpc_delete_company SECURITY DEFINER — run supabase/company_rpcs.sql; clears profiles.company_id for all members, removes asset_permissions, company_members, then company row (FK SET NULL handles machines/vehicles/etc.) | Business |
| Regenerate invite code | ✅ | regenerateInviteCode() — uses crypto.randomUUID() (CSPRNG) for the 8-char code | Business |
| Company logo upload | ✅ | companies.logo (base64) | Business |
| Hourly rate / tax rate / tax label config | ✅ | companies fields — edited in Settings → Billing & Storage (moved from CompanySettings; saved via updateCompany()) | Any tier with org |
| Machine provisioning panel (CompanySettings) | ✅ | machine_permissions — run supabase/create_machine_permissions.sql; machine_perms_update policy now has explicit WITH CHECK (prevents machine owner changing machine_id to a machine they don't own in a single UPDATE) | Business |
| Asset provisioning panel (vehicles/equip/tools) | ✅ | asset_permissions, CompanySettings | Business |

---

## 12. Wiki

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| wiki_entries table | ✅ | — | Free |
| wiki_revisions table | ✅ | wiki_entries — run supabase/wiki_revisions_rls_helper.sql; SELECT policy uses _wiki_entry_visible() SECURITY DEFINER helper (decouples revisions RLS from wiki_entries RLS — without the helper, future wiki_entries policies could silently break revision SELECT) | Enthusiast+ |
| Browse + search wiki | ✅ | wiki_entries — SELECT RLS: non-sample entries public; sample entries visible to owner only; INSERT WITH CHECK: created_by = auth.uid() AND (NOT is_sample OR sample_owner_id = auth.uid()) — blocks injecting fake sample entries into another user's sample library; UPDATE RLS restricted to entry author; column-level REVOKE/GRANT limits author updates to make/model/type/slug; slug CHECK constraint (^[a-z0-9][a-z0-9-]*$); run supabase/wiki_rls.sql; search query stripped to alphanumeric+space before PostgREST interpolation; userId validated as UUID before sample filter interpolation; multi-token AND search: query split by whitespace, each token must match at least one of make/model/type/slug (ilike %token%) so "honda 200" finds only entries with both — if AND returns 0 results falls back to OR of all tokens ranked client-side by how many tokens each entry matches (next-best-match); matched tokens highlighted in green in result rows (make, model, type badge); if the only match is in the slug field the slug is shown as context | Free |
| Wiki collaborative rev pointer | ✅ | update_wiki_rev_pointer(p_entry_id, p_rev_id) RPC — run supabase/wiki_advance_rev_rpc.sql then supabase/wiki_rev_pointer_lock.sql; SECURITY DEFINER; caller must be entry author or contributor AND target revision author or entry author; FOR UPDATE row lock on wiki_entries serializes concurrent calls (eliminates TOCTOU race where two simultaneous edits could orphan one revision from current_rev_id); IS DISTINCT FROM guard makes duplicate calls idempotent | Free |
| View count tracking | ✅ | wiki_entries.view_count + increment_wiki_views() RPC — run supabase/wiki_view_count_rpc.sql then supabase/wiki_view_count_anon_fix.sql; SECURITY DEFINER RPC restricted to authenticated only (anon grant removed — bots could inflate counts without authenticating); WHERE clause includes AND NOT is_sample so sample entries never accumulate view counts; client-side per-session Set in wiki.js prevents the same entry from being incremented more than once per page load | Free |
| Create / edit wiki entry | ✅ | wiki_entries | Enthusiast+ |
| Field-level editing with edit summary | ✅ | wiki_revisions | Enthusiast+ |
| Full revision history | ✅ | wiki_revisions | Enthusiast+ |
| Submit machine specs to wiki | ✅ | machines → wiki_entries | Enthusiast+ |
| Wiki pre-populate on Add Machine | ✅ | MachineForm.jsx — when adding a new machine, 800ms debounce triggers lookupWikiEntry(make,model,userId) (wiki.js) which does a case-insensitive exact make+model column match so it finds both public non-sample entries and the user's own sample entries (slug-based lookup missed sample entries whose slugs are suffixed with -sample-{uid8}) after both make+model are typed; if a wiki entry with a current revision exists, a green inline banner appears below the make/model row: "Wiki match — [Make] [Model] · pre-fill known specs?" with disclaimer "Community data · always verify before use · the more specs users contribute, the more accurate future pre-fills become"; Pre-fill button calls applyWikiSuggestion() which maps every wiki specData key to its corresponding form state setter (identity, engine, ignition, starter, fuel/injection, cooling, turbo, bore/stroke/piston/rings/gudgeon/crank/conrod/cylinder, PTO/shaft, drivetrain, suspension, brakes, tyres, blade/deck, chainsaw bar+chain, outboard, pump, generator, fluids, service intervals, dimensions); only fills empty fields — never overwrites existing user input; handles key-name differences between sample entries and user-submitted entries (frontBrakeType→frontBrake, tyreSizeFront→tyreFront, lengthMm→overallLength, widthMm→overallWidth, heightMm→overallHeight, weightKg→dryWeight); also fills carb brand/model (cBrand, cModel); Skip/✕ dismiss the banner; no banner shown when editing an existing machine; all sections containing pre-filled data are auto-expanded so values are immediately visible; value normalization: coolingType "Air-cooled"→"Air cooled" / "Liquid-cooled (…)"→"Liquid cooled" to match COOLING_TYPES select options, fuelSystem "Carburettor"→"Carburetted" to match fuel delivery toggle; cBrand also fills carbBrandSpec (CarbSpec section select, visible for 2-stroke and carburetted 4-stroke) and triggers setSecCarbSpec(true); cooling data (coolingType/coolantType/coolantCapacity/thermostatTemp) and fuel tank/mix (fuelTankCapacity/mixRatio) all render in secFluids — expand trigger corrected from dead secCooling variable to setSecFluids(true); starterType expand corrected to setSecIgnition since starter renders inside the Ignition section; num() helper strips unit suffixes before filling type="number" inputs — wiki sample data stores values like "196cc", "120 PSI", "1400 ±150 RPM", "0.15mm (cold)" which browsers silently reject in number inputs leaving fields blank even though state is set (computed displays still worked); num() extracts the first decimal number from any string (e.g. "8.5:1"→"8.5") applied to all ~45 numeric fields in applyWikiSuggestion; select field normalization: wiki data uses descriptive strings that don't match option values — regex normalizers added for valveTrain ("OHV — 2 valves per cylinder"→"Pushrod (OHV)", "DOHC — 4 valves"→"DOHC", "OHC — 2 valves"→"OHC"), starterType ("Recoil"→"Recoil only", "Electric"→"Electric / key start only", "Electric + kick"→"Recoil + electric"), transType ("6-speed manual"→"Manual", "4-speed semi-auto"→"Semi-auto / Paddle shift"), clutchType ("Wet multi-plate"→"Multi-plate wet", "Centrifugal drum"→"Centrifugal"), forkType ("KYB 48mm USD Cartridge"→"USD", "Telescopic"→"Telescopic fork"), rearShockType ("KYB Link-type Monocross"→"Monoshock"), frontBrake/rearBrake ("Single hydraulic disc — 250mm"→"Disc") | Free |
| Wiki autocomplete on Make/Model fields | ✅ | MachineForm.jsx — WikiAutocomplete component wraps make (non-vehicle types) and model inputs; 200ms debounce calls getWikiMakes(query) / getWikiModels(make, query) in wiki.js (ilike on wiki_entries, is_sample=false only); results sorted prefix-first then alphabetical; model suggestions scoped to the typed make via ilike filter; dropdown supports keyboard nav (↑↓ Enter Esc); free-text entry still works — suggestions are optional; vehicle make retains VEHICLE_MAKES select | Free |
| Author attribution | ✅ | wiki_revisions.author_id | Enthusiast+ |
| Admin delete any wiki entry | ✅ | VITE_ADMIN_EMAIL env var check in WikiEntryPage, deleteWikiEntry() | Admin only |
| Admin inline field editing on wiki entry page | ✅ | WikiEntryPage.jsx — ✏ edit button only shown when session email is in ADMIN_EMAILS (nathan.gentil.ai@gmail.com + nathan.gentil@gmail.com); non-admin users cannot see or trigger inline field edits; edit targets revData, calls saveWikiFieldEdit() to write a new revision; Enter=save, Escape=cancel | Admin only |
| Wiki entry: last-editor attribution | ✅ | WikiEntryPage.jsx — shows "Last updated by [username] · [date]" below the top bar using entry.currentRevision.username + created_at; edit_summary shown if non-default (hidden when "Updated specs"); date formatted with toLocaleDateString | Free |
| Wiki entry: Add to Garage import | ✅ | WikiEntryPage.jsx + upsertMachine() — logged-in users (profile exists) see "+ Add to Garage" button; calls upsertMachine({make, model, type, ...specOnly}) without an ID so it always inserts a new machine; button replaced by "✓ Added to garage" confirmation after success and cannot be clicked again; importing=true shows "Adding…" and disables button | Free |
| Wiki field labels: motorcycle/ATV/powersports fields | ✅ | wiki.js WIKI_FIELD_LABELS — added wotPower (Max Power), torqueNm (Max Torque N·m), topSpeed (Top Speed), frameType (Frame Type), wheelbaseMm (Wheelbase mm), seatHeightMm (Seat Height mm), groundClearanceMm (Ground Clearance mm); these fields now display on the wiki entry page spec grid for motorcycle/ATV/snowmobile/PWC entries imported from Wikipedia | Free |
| Wiki entry: contribution disclaimer | ✅ | WikiEntryPage.jsx — static box at bottom of every wiki entry page: "Is this information correct? … add this machine to your garage using + Add to Garage, fill in any missing details, then tap Push to Wiki on your machine. Your update will appear here with your name attached." — guides community corrections through the garage flow rather than direct wiki edits | Free |
| ~~Per-user sample wiki entries~~ | ❌ removed | seedSampleWikiEntries() and SAMPLE_ENTRIES deleted from wiki.js; WikiHomePage seeding useEffect removed; lookupWikiEntry userId param removed (always filters is_sample=false); existing DB rows cleaned up via scripts/wiki-import/remove-sample-entries.mjs (wiki-cleanup workflow, task=remove-samples) | — |
| Wiki bulk import scripts | ✅ | scripts/wiki-import/ — eleven Node.js ESM scripts for bulk-populating the wiki: nhtsa.mjs (NHTSA VPIC API → 100k+ vehicle/motorcycle skeletons); kaggle-motos.mjs (Kaggle CSV → ~10k motorcycles with full specs); epa-engines.mjs (EPA NRSI CSV → certified small engines); training-data-seed.mjs (120+ Stihl/Husqvarna/Echo/Honda GX/B&S/Kawasaki FX/Kohler/Yamaha outboards/generators/snowblowers/pressure washers); training-data-seed-2.mjs (50+ marine outboards — Honda BF, Mercury FourStroke/Verado, Evinrude E-TEC/G2, Suzuki DF, Yamaha F-series, Tohatsu); training-data-seed-3.mjs (50+ dirt bikes — Honda CRF, Yamaha YZ/WR, KTM SX/EXC, Kawasaki KX, Suzuki RM/RMZ, Husqvarna FC/FE, Beta, GasGas, Sherco, trail bikes); training-data-seed-4.mjs (60+ entries — Sea-Doo/Yamaha WaveRunner/Kawasaki Jet Ski PWC, Honda/Yamaha/Polaris/Can-Am ATVs+UTVs, Kubota/Yanmar/Hatz diesel engines, Predator/Lifan/DuroMax GX clones, OS/Saito/Zenoah/Rotax/IAME/LO206 RC+kart engines, snowmobiles, road bikes); training-data-seed-5.mjs (~35 cruisers/tourers — Harley-Davidson Milwaukee-Eight/Sportster S/Street Glide, Triumph Bonneville/Thruxton/Tiger/Street Triple/Speed Triple/Rocket 3, BMW R1250GS/RT/S1000RR/F850GS/RnineT/G310GS, Ducati Monster/Panigale V4/Multistrada/Scrambler/Hypermotard, Indian Scout/Chief/Chieftain/Pursuit, Honda Gold Wing GL1800, Yamaha MT-09/MT-10/XSR900/V-Star, Kawasaki Ninja 650/Z900/ZX-10R/Vulcan S, Suzuki GSX-S1000/Boulevard/V-Strom); training-data-seed-6.mjs (~38 sport/ADV/scooters — Honda CBR600RR/CBR1000RR-R/Africa Twin/CBR500R/CB300R, Yamaha R1/R6/R7/Ténéré 700/MT-03, Kawasaki ZX-6R/Versys 650+1000, Suzuki GSX-R600/R1000R/V-Strom 1050, KTM 890/1290 Adventure, Husqvarna Norden 901, Aprilia Tuareg 660/RS 660, scooters PCX125/Forza 350/NMAX 155/XMAX 300/TMAX 560/Vespa GTS 300/MP3 500/Kymco AK550/SYM TL500/Burgman 400, RE Meteor/Classic 350, Yamaha MT-03, Kawasaki Z400, Benelli TNT600); training-data-seed-7.mjs (~37 commercial/UTVs/construction — Scag/Ferris/Gravely/Hustler/Exmark/Bad Boy commercial ZTRs, Club Car/E-Z-GO/Yamaha Drive2 golf carts, Honda Pioneer/Yamaha Wolverine/Polaris General/Can-Am Defender/Kubota RTV-X/JD Gator UTVs, Wacker plate compactor/rammer/Multiquip trash pump/Husqvarna floor saw/Generac+B&S+Champion generators/Ariens snowblower, JD E110/X590/Cub Cadet XT2/Troy-Bilt Pony/Craftsman T150/Ariens Zoom ride-ons); training-data-seed-8.mjs (~43 arborist/specialty — Stihl MS193T/MS201TC-M/MS462/Husqvarna 540i XP/Echo CS-2511T/Makita top-handle arborist saws, Stihl/Husqvarna/Echo hedge trimmers, Stihl/Echo/Husqvarna pole pruners, Stihl BR600/Husqvarna 580BTS/Echo PB-8010T backpack blowers/Stihl SR430 mist blower, Honda/Troy-Bilt/Husqvarna tillers, Honda EU7000is/Yamaha EF6300iSDE/Westinghouse/Predator/DuroMax inverter generators, Honda WT30X/Davey water pumps, Belle concrete mixer, vintage 2-strokes Kawasaki KH250/Yamaha RD350/Honda CB175/Kawasaki KE100/Yamaha DT175); training-data-seed-9.mjs (~55 clone engines (GX160/GX200/212/270/390/420cc clone families (generic 168F/168F-2/177F/188F + Loncin/Rato/Zongshen/Ducar/Baumr/WEN/SGS/Daytona branded), Predator 212 Hemi vs Non-Hemi detailed variants, Tillotson H212 RS + T225RS race clones, GY6 scooter family (49cc/125cc/150cc vertical+horizontal/180cc/250cc), Chinese pit bike engines (70cc CRF50 clone, 110cc 1P52FMH, Lifan LF152FMH/LF154FMI, Zongshen ZS155FMI, YX140/YX160 performance), Chinese cub/moped engines (70cc C70 clone, 110cc Wave/Dream clone, Loncin G155FB/G200F), Chinese 2-stroke scooters (1E40QMB air + 1PE40QMB liquid-cooled Minarelli clones), complete machines (Coleman CT200U-EX, Baja MB200, TrailMaster Mini XRX), misc brands (XtremepowerUS, Tomahawk TPE-212, Chongqing Rato R80), Chinese V-twins (Loncin LC2V80F 688cc, Ducar DPC20B 420cc boxer)); training-data-seed-holzfforma.mjs (10 Holzfforma/Farmertec chainsaw clones: G255/G366/G372/G372XP/G388/G395XP/G444/G466/G660/G888 — OEM-compatible with Stihl MS250/361/380/440/460/660/880 and Husqvarna 365/372XP/394XP/395XP, specs sourced from Farmertec product sheets and cross-verified with bore×stroke calculations, added as training-data-holzfforma option in wiki-import workflow); training-data-seed-10.mjs (~40 2-stroke RC/hobby engines — DLE-20/DLE-30/DLE-35/DLE-55/DLE-60/DLE-85/DLE-111/DLE-120/DLE-170/DLE-222 twin, EME-35/70/120/300B, 3W-28i/55i/106CS twin, DA-35/DA-50/DA-70/DA-85/DA-120/DA-150, OS GT15/GT33/GT60 petrol, Zenoah G20EI/G38/G45/G62, OS .61FX/.91FX glow, YS .91FZ glow, Saito FA-90/FA-125/FA-300T 4-stroke glow, Chinese .46/.21 RC 2-stroke glow clones, DLA-32/DLA-56 UAV engines); all scripts idempotent, batch-insert 500 at a time, --dry-run and --limit=N; triggered via GitHub Actions workflow_dispatch with source dropdown: training-data / training-data-2-marine / training-data-3-dirtbikes / training-data-4-everything / training-data-5-cruisers / training-data-6-sport / training-data-7-commercial / training-data-8-arborist / training-data-9-clones / training-data-10-rc2stroke / nhtsa-motorcycle / nhtsa-all / kaggle-motos / epa-engines; cleanup-thin-entries.mjs removes wiki entries whose current revision has fewer than N non-empty fields (default 10); cleanup-duplicates.mjs finds entries with the same make+model (case-insensitive) and deletes all but the best (winner = most fields, then most views, then newest); remove-sample-entries.mjs deletes all is_sample=true entries — all triggered via .github/workflows/wiki-cleanup.yml task dropdown (full-cleanup / deduplicate / thin-entries / remove-samples), defaults dry-run=true; full-cleanup runs deduplicate then thin-entries in one pass; deletes contributions + revisions before entries to satisfy FK constraints; wikipedia-import.mjs fetches machine specs from Wikipedia infoboxes — expanded to 51 brand entries across 5 categories: ope (Stihl/Husqvarna/Echo/Makita/Dolmar/Jonsered/Partner/McCulloch/Poulan/Shindaiwa/RedMax/Tanaka/Zenoah/Toro/Ariens/Gravely/Scag/Ferris/Exmark/Snapper), engine (Honda/Kawasaki/Briggs & Stratton/Kohler/Robin/Tecumseh/Lombardini), marine (Yamaha/Mercury Marine/Evinrude/Johnson/Tohatsu/Suzuki), motorcycle (Honda/Yamaha/Kawasaki/Suzuki/KTM/BMW/Ducati/Triumph/Harley-Davidson/Aprilia/Indian/Royal Enfield/Moto Guzzi/MV Agusta/Benelli/Beta/GasGas/Husqvarna/Sherco), atv (Polaris/Can-Am/Arctic Cat/Ski-Doo/Sea-Doo); parses infobox fields including motorcycle-specific bore×stroke split field, engine free-text (extracts cc/cooling/cylinders/valvetrain), wotPower, torqueNm, topSpeed, wheelbaseMm, seatHeightMm, groundClearanceMm, frameType; normalises units and enum values; skips entries with <10 spec fields and duplicate slugs; inserts via batchInsert; category pagination (cmcontinue) handles large categories like Honda/Yamaha/Kawasaki motorcycles (200+ members each); triggered via .github/workflows/wikipedia-import.yml with category dropdown (all/motorcycle/ope/marine/atv/engine), optional make filter, dry-run flag; timeout extended to 180 min for full runs | Admin only |

---

## 12. Navigation & UX

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| 🔨 Workshop parent tab (nested sub-tab bar) | ✅ | App.jsx, WORKSHOP_TABS constant | Free |
| Workshop sub-tabs: Parts, Clients, Tools, Vehicles, Equipment, Consumables, Revenue | ✅ | WORKSHOP_TABS, App.jsx content panels | Free / Ent+ |
| Per-subtab upgrade banner (shows only when at item limit) | ✅ | VehiclesTab / EquipmentTab / ToolsTab / StockItemTab — each shows banner only when atLimit/atAssetLimit; global Workshop tab banner removed from App.jsx | Free |
| Revenue sub-tab gated behind Enthusiast+ | ✅ | WORKSHOP_TABS enthusiastOnly flag | Enthusiast+ |
| Per-user Workshop tab visibility preferences | ✅ | profiles.tab_order.workshop_visible (Supabase), TabOrderSettings.jsx checkboxes | Free |
| Per-user Workshop default sub-tab | ✅ | First visible tab in ordered workshop list (implicit, no separate setting) | Free |
| Workshop visibility + order UI under Settings → ⇅ Tabs | ✅ | TabOrderSettings.jsx WorkshopReorderList (checkboxes + ↑/↓ + DEFAULT badge) | Free |
| Users tab moved into Settings (Business only) | ✅ | SettingsPage, UsersTab | Business |
| User preferences cross-device sync (sort, view, cols, active tab, tutorial flags) | ✅ | profiles.preferences JSONB + upsert_preference RPC — run supabase/preferences_migration.sql; RPC verifies p_user_id = auth.uid() to prevent cross-user writes; key allowlist enforced server-side to prevent overwriting rate-limit timestamps or injecting arbitrary keys | Free |
| One-time localStorage → preferences migration | ✅ | migrateLocalPreferences() in preferences.js — runs on first profile load before prefsSynced is set (blocking the tab-save effects until migration completes, preventing old LS values overwriting new DB values); migrates all known LS pref keys to profiles.preferences; sets _lsMigrated guard; removes migrated LS keys | Free |
| Settings tab bar horizontally scrollable on mobile | ✅ | SettingsPage.jsx overflowX:auto | Free |
| Per-account tab reordering (main nav, workshop, settings) | ✅ | profiles.tab_order JSONB, applyTabOrder(), TabOrderSettings.jsx | Free |
| Tab order UI under Settings → ⇅ Tabs (↑/↓ reorder + reset) | ✅ | TabOrderSettings.jsx | Free |
| Tab order persists across sessions and devices | ✅ | Supabase profiles.tab_order, loaded on profile fetch | Free |

---


## 13. Queued Features

| Feature | Status | Blocked by / Notes |
|---------|--------|--------------------|
| Asset provisioning UI in CompanySettings | ✅ | Ships with Machines + Vehicles + Equipment + Tools sections |
| Assign driver/member to vehicle | ✅ | Shipped: VehicleMemberSection in VehiclesTab |
| Workshop tab visibility stored in profiles (cross-device sync) | ✅ | Shipped: profiles.tab_order.workshop_visible, syncs via Supabase |
| VPS radio transcription service — ffmpeg + silero-vad + faster-whisper large-v3 → Supabase radio_transcripts | 📋 | Needs Broadcastify Premium (or free stream URL); separate Python service, not in this repo |
| Photo migration → Supabase Storage | 📋 | Currently base64 in DB rows — expensive |
| Push notifications (service due) | 📋 | Needs FCM or similar |
| Auto-calc: electrical load from lighting entries (always-on) | ✅ | MachineForm.jsx — smartMode toggle removed; load auto-sums from Lighting section entries, net charge rate auto-calculates when chargeAmps + chargeVoltage present | Free |
| Invoice / Quote PDF (separate from spec PDF) | 📋 | Currently HTML export only |
| General Terms of Service page | ✅ | TermsPage.jsx — public URL: ratbench.net/terms |
| Privacy Policy page | ✅ | PrivacyPage.jsx — public URL: ratbench.net/privacy |
| Data Retention Policy page | ✅ | DataRetentionPage.jsx — public URL: ratbench.net/data-retention |
| API access | ❌ | Not being built — removed from billing copy |
| Firebase migration | 📋 | Long-term — after features stable |

---

## How to read this

- **"Depends on"** = the thing must exist and work for this feature to function. If you break the dependency, this feature breaks.
- **Tier** = minimum tier required. Free features work for everyone.
- Features in section 12 have no code yet. Everything else is live.
