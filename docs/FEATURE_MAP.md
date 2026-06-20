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
| Auto-create profile on first login (no onboarding screen) | ✅ | App.jsx loadForSession | Free |
| Password reset | ✅ | auth | Free |
| Guest upgrade modal + profile banner | ✅ | auth — "Save Your Data" green banner shown at top of Profile settings page for anonymous users, above all other sections | Free |
| Profiles table + RLS | ✅ | auth.users — run supabase/org_and_profiles_rls.sql; SELECT for all authenticated (usernames public for wiki/member lists); UPDATE own only | Free |
| Tier system (`gates.js`) — Free / Enthusiast $3.50wk / Business $10wk | ✅ | profiles.tier | All |
| Stripe Checkout (3 plans: Free / Enthusiast / Business) | ✅ | Stripe, profiles — create-checkout edge fn verifies JWT + confirms caller matches user_id; company billing also verifies company membership before creating session | All |
| Stripe webhook → tier update | ✅ | Stripe, profiles/companies — signature verified with constructEventAsync; unmapped price IDs log an error instead of silently downgrading users | All |
| Billing portal (manage/cancel) | ✅ | Stripe customer ID — create-portal edge fn verifies JWT + caller identity before returning portal URL | All |
| Announcements (in-app banners) | ✅ | profiles.tier — RLS: SELECT for all authenticated; INSERT/UPDATE/DELETE restricted to admin email only (run supabase/announcements_rls.sql) | All |
| Machines RLS (own + provisioned policies) | ✅ | scalability_hardening.sql | All |
| DB-level machine limit trigger (free=5, guest=3) | ✅ | scalability_hardening.sql, profiles.tier — enforce_machine_limit uses FOR UPDATE on profiles row to serialize concurrent inserts (prevents race condition bypassing the cap) | Free |
| Critical DB indexes (machines, services, bookings, permissions) | ✅ | scalability_hardening.sql | All |
| Checkout rate-limit (blocks duplicate Stripe sessions) | ✅ | create-checkout edge fn | All |
| Sentry error tracking | ✅ | VITE_SENTRY_DSN env var | All |
| Admin panel analytics (users, active, machines, signups trend) | ✅ | AdminPanel.jsx OverviewTab + admin_get_stats() RPC — run supabase/admin_get_stats.sql to update; server-side auth.email() check blocks non-admin calls | Admin only |
| Admin: hard-delete user from Supabase + all data + storage photos | ✅ | AdminPanel.jsx UsersTab Delete button + admin_delete_user() RPC + deleteUserPhotos() — run supabase/admin_delete_user.sql AND supabase/admin_storage_policy.sql — cleans: company_members, machine_permissions, asset_permissions, services, machine_bookings, machines, clients, inventory_items, vehicles, equipment, tools, consumables, wiki_contributions, wiki_revisions, wiki_entries, asset_assignments, profiles, auth.users; if user was sole owner of a company, that company's tier is reset to free and stripe_subscription_id cleared — admin account (VITE_ADMIN_EMAIL) is blocked from deletion | Admin only |
| Admin: delete wiki entries by a specific user | ✅ | AdminPanel.jsx UsersTab Del Wiki button + admin_delete_user_wiki(uuid) RPC — run supabase/admin_delete_user_wiki.sql | Admin only |
| Admin: delete individual wiki entry | ✅ | WikiEntryPage — admin delete button visible when VITE_ADMIN_EMAIL matches; deleteWikiEntry() manually deletes contributions + revisions before entry | Admin only |
| Admin: bulk-delete all wiki entries | ✅ | admin_delete_all_wiki() RPC — run supabase/admin_delete_wiki.sql; deletes contributions, revisions, and entries in order | Admin only |
| upgrade_grants table + RLS | ✅ | Stores admin-issued tier grants (email + tier + expiry); run supabase/upgrade_grants_rls.sql — admin-only SELECT/INSERT/UPDATE/DELETE; without RLS any authenticated user could read all grant records | Admin only |
| Towing allocation tables (depots, tow_trucks, tow_allocation_log) | ✅ | supabase/create_towing_tables.sql + supabase/add_tow_allocation_log.sql — admin-only RLS using auth.email() = 'nathan.gentil.ai@gmail.com' | Admin only |
| Photo viewer: X button + Android back button closes viewer | ✅ | PhotoViewer.jsx — manualClose() pattern (stopPropagation on X prevents double history.back), 52px tap target | All |
| Machine card: Android back button collapses expanded card | ✅ | MachineCard.jsx — pushState({ cardOpen: id }) on expand, popstate listener collapses it | All |
| Android PWA: "Press back again to exit" toast | ✅ | src/lib/backGuard.js — installBackGuard() called in main.jsx before React renders; 2 s window | All |
| Wipe all base64 photos from DB | ✅ | supabase/wipe_photos.sql — run once in SQL Editor (irreversible) | Admin only |
| Photo storage — Supabase Storage bucket | ✅ | supabase/create_photos_bucket.sql + src/lib/storage.js — run SQL first, then deploy; PhotoAdder rejects files over 50MB client-side before canvas resize attempt | All |
| Photo cleanup on asset delete | ✅ | deletePhoto() in storage.js called when deleting: machines (deleteMachineApi — fetches main+port photos from machines table + plug/job photos from services table before row delete), vehicles, tools, equipment, clients, parts, consumables (deleteConsumable fetches photos column before row delete) | All |
| Photo cleanup on service log entry delete | ✅ | MachineCard delSvc: collects plugPhoto + jobPhotos from svc state before deleteServiceApi; VehiclesTab removeSvcEntry: same (vehicle entries use ServiceModal which adds photos); tools/equipment service log entries are inline-only (no photos, no cleanup needed) | All |
| Preconnect hints (Fonts + Supabase dns-prefetch) | ✅ | index.html | All |
| Non-blocking announcements fetch (deferred after first paint) | ✅ | App.jsx IIFE after setInitializing | All |
| Auto-retry on total load failure + friendly slow-connection message | ✅ | App.jsx loadForSession — if 4+ parallel fetches fail, waits 2 s and retries once silently; loading screen shows "Taking a bit longer than usual… slow connection — giving it another go" during the wait instead of alarming the user | All |
| Service worker / PWA static asset cache (repeat-visit perf) | ✅ | vite-plugin-pwa, dist/sw.js | All |
| Shared `UpgradeBanner` component (green box, label, Upgrade → button) | ✅ | src/components/ui/UpgradeBanner.jsx — used in JobBoard, ServiceReminders, VehiclesTab, EquipmentTab, ToolsTab, StockItemTab, WikiTab | All |

---

## 2. Machine Tracker (core)

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machines table (200+ columns, RLS) | ✅ | profiles, companies | Free |
| Create / edit / delete machine | ✅ | machines table, transforms.js | Free |
| First-run arrow guide (3-step tutorial: arrow → + Add · arrow → first card · in-card button key) | ✅ | Tracker.jsx GuideStep1/GuideStep2 + MachineCard showGuide prop — curved hand-drawn orange SVG arrows with pulsing glow; step 3 annotates each button (Edit Machine, PDF, Share, Layout, + LOG) inside the expanded card; dismissed state stored in profiles.preferences | Free |
| First-run tab guides (all tabs) | ✅ | TabGuide.jsx shared component — two variants: "add" (right-aligned, arrow up-right toward + Add button) and "info" (centered, arrow down toward content); dismissed state stored per-key in profiles.preferences (rat_tut_jobs · rat_tut_search · rat_tut_revenue · rat_tut_clients etc.); same orange glow SVG arrow style as Tracker guide | Free |
| Job card first-use inline guide | ✅ | JobBoard.jsx JobCard — green tip block shown on first expand (profiles.preferences.rat_tut_job_card); explains Notes / Timer / Parts / Status buttons; "got it" dismiss | Free |
| Share machine link (🔗 copies /m/:id URL, 2-sec ✓ feedback) | ✅ | MachineCard.jsx copied state + clipboard API | Free |
| Public machine page (ratbench.net/m/:id, no auth required) | ✅ | PublicMachinePage.jsx + main.jsx route check + get_public_machine() RPC — run supabase/public_machine.sql; exposes only: id, name, type, make, model, year, last_service_date, last_service_odo, photos (time_log and notes are intentionally excluded); shows cover photo hero banner; accent-coloured QR code; "Add this machine" deep-link pre-fills Add Machine form | Free |
| Machine form (all 200+ spec fields) | ✅ | machines, machineTypes constants | Free |
| Machine form sections guide (first-run callout above section list) | ✅ | MachineForm.jsx showFormGuide state — "more specs = more calcs" tip (bore+stroke → compression ratio & piston speed; lighting entries → charge load, all auto); lists 8 key sections with curved orange arrows; Service Intervals highlighted; prominent orange "got it ✓" dismiss button; dismissed state in profiles.preferences.rat_form_tut; auto-dismisses on first save | Free |
| First-add field glow (Type + Name) | ✅ | MachineForm.jsx firstAdd flag (showFormGuide && !existing) — pulsing orange box-shadow on Type select and Name input; .field-guide CSS class in index.css; clears after guide dismissed | Free |
| List view + grid view | ✅ | machines, MachineTile, MachineCard | Free |
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
| services table + RLS | ✅ | machines — run supabase/services_rls.sql; policies: full access for service creator or machine owner, read-only for provisioned members via _provisioned_machine_ids() helper | Free |
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
| machine_bookings table + RLS | ✅ | machines, auth.users — own policy in storage_migration.sql; run supabase/machine_bookings_provisioned.sql to allow provisioned company members to read bookings for machines they have access to | Enthusiast+ |
| Global enable toggle (`profiles.storage_policy_enabled`) | ✅ | profiles | Enthusiast+ |
| Storage tiers (Bench/Small/Medium/Large/Extra Large/Custom) | ✅ | storageTiers.js DEFAULT_STORAGE_TIERS | Enthusiast+ |
| Configurable tier rates (freeDays/dailyRate/escalateDays/minFee) | ✅ | profiles.storage_tiers JSONB, getTiers(), StorageSettings inline edit | Enthusiast+ |
| Book In — create a booking with tier + received date | ✅ | machine_bookings, MachineCard | Enthusiast+ |
| Per-visit storage toggle (charge/pause billing) | ✅ | machine_bookings.storage_enabled | Enthusiast+ |
| Mark Collected — close booking, stop accrual | ✅ | collectMachine(), MachineCard | Enthusiast+ |
| Tile badge: free days remaining (green) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| Tile badge: accrued fees (orange) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| Tile badge: ⚠ FOR SALE escalation (red + glow) | ✅ | getStorageStatus(), MachineCard | Enthusiast+ |
| ServiceReminders: escalation + billing alerts | ✅ | getAllActiveBookings(), getStorageStatus() | Enthusiast+ |
| ServiceReminders: consumable stock alerts (LOW / OUT / OVER) | ✅ | getConsumables(), ServiceReminders.jsx | Free |
| Invoice: storage fees line item | ✅ | getActiveBooking(), exportClientInvoice() | Enthusiast+ |
| Storage Settings tab (toggle + editable tier table) | ✅ | StorageSettings.jsx, SettingsPage | Enthusiast+ |
| Booking history per machine | ✅ | getBookingHistory(), machine_bookings | Enthusiast+ |
| Custom daily rate override per visit | ✅ | machine_bookings.storage_fee_override | Enthusiast+ |
| Storage revenue in Revenue Dashboard | ✅ | getClosedBookings(), getClosedBookingFee(), RevenueDashboard | Enthusiast+ |
| Storage revenue card (realized, per period) | ✅ | filteredBookings, storageRev | Enthusiast+ |
| Storage revenue per-machine breakdown | ✅ | storageByMachineId, byMachine | Enthusiast+ |
| Storage included in Gross Profit total | ✅ | grossProfit = labour + parts + storage − cost | Enthusiast+ |

---

## 6. Job Board & Time Tracking

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| Jobs tab: shows first 3 machines only on free tier (FREE_LIMIT=3) | ✅ | JobBoard.jsx FREE_LIMIT | Free (limit) |
| Job timer (start / stop / pause) | ✅ | machines.job_timer (jsonb) | Free |
| Multiple timers per machine | ✅ | machines.job_timer array | Free |
| Timer sync: lock when another member running | ✅ | job_timer.startedBy, Realtime | Business |
| Time log (save sessions with label + notes) | ✅ | machines.time_log (jsonb) | Free |
| Running timer badge in Jobs tab | ✅ | machines.job_timer status | Free |
| Invoice generation (labour + parts) | ✅ | time_log, inventory, company rates — sequential invoice numbers via next_invoice_number RPC (run supabase/invoice_number_rpc.sql; stores per-year counter in profiles.preferences with FOR UPDATE); falls back to year+random if RPC unavailable | Free |
| Parts markup on invoice | ✅ | inventory buy/sell price | Free |
| Tax calculation on invoice | ✅ | companies.tax_rate, tax_label | Business |
| Invoice number auto-increment | ✅ | invoices.js — next_invoice_number RPC (DB-only, no local fallback) | Free |
| HTML invoice export | ✅ | time_log, parts, company details | Free |
| Collapsed/expanded job card layout (matching asset tabs) | ✅ | JobBoard, JobCard | Free |
| Common jobs autocomplete | ✅ | COMMON_JOBS constant | Free |
| Barcode scanner (keyboard detection) | ✅ | inventory items | Free |
| Stock auto-deduct on part use (parts) | ✅ | adjustStock(), inventory | Free |
| Stock auto-deduct on consumable use | ✅ | adjustConsumableQty(), consumables | Free |
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
| inventory_items table + RLS | ✅ | profiles — run supabase/inventory_items_rls.sql (table had no RLS; any auth user could read all rows) | Free |
| Create / edit / delete parts | ✅ | inventory_items | Free |
| Buy price / sell price / stock qty | ✅ | inventory_items.payload (jsonb) | Free |
| Min par / max par levels with LOW/OVER badges | ✅ | inventory_items.payload minQuantity/maxQuantity | Free |
| 20 workshop-specific part categories (Tyres, Filters, Spark Plugs, Fasteners, Engine Components, etc.) | ✅ | partsTypes.js, StockItemTab typeConfig | Free |
| Category-specific spec fields per part type (gap/heat range for plugs, pitch/gauge for chains, ET/PCD for wheels, etc.) | ✅ | partsTypes.js PART_CATEGORY_SPECS | Free |
| Part category groups filter bar (Tyres & Wheels, Engine, Fuel & Induction, Ignition, Drive Train, etc.) | ✅ | partsTypes.js PART_CATEGORY_GROUPS | Free |
| QR code label generation + print | ✅ | inventory_items, qrcode library | Free |
| Barcode scanner input | ✅ | keyboard detection | Free |
| Stock adjustment (use / restock) | ✅ | inventory_items.payload | Free |
| Machine parts list (per-machine) | ✅ | machines.parts (jsonb) | Free |
| localStorage → Supabase migration | ✅ | inventory_items | Free |
| Photos per part (stored in payload JSONB) | ✅ | inventory_items.payload.photos | Free |
| Cover photo selection (☆ Cover) for parts | ✅ | PartsTab | Free |
| Shared UI (StockItemTab) with Consumables tab | ✅ | StockItemTab.jsx, tableType prop | Free |

---

## 9. Clients & Invoicing

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| clients table + RLS | ✅ | profiles, companies | Enthusiast+ |
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
| asset_permissions table + RLS | ✅ | auth.users, company_members | Business |
| **vehicles** table + RLS | ✅ | asset_permissions | Free |
| Vehicles tab: CRUD + service log + photos | ✅ | vehicles table | Free (1 limit) |
| Vehicle service log: full ServiceModal (types, datetime, plug photo, job photos, edit) | ✅ | ServiceModal, VehiclesTab — saving guard prevents duplicate entries on double-click; plug photo replace uploads new first then deletes old (safe on network failure) | Free |
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
| **asset_assignments** table + RLS (replaces vehicle_assignments for cross-type) | ✅ | asset_assignments_migration.sql | Free |
| Vehicle loadout: assign tools/equipment/consumables/parts to a vehicle | ✅ | asset_assignments, LoadoutSection — assignment only from VehiclesTab; LoadoutSection removed from Tools/Equipment/StockItemTab | Free |
| Vehicle loadout item limit (free=5, paid=unlimited) | ✅ | LoadoutSection maxItems prop — VehiclesTab passes 5 for free tier; shows n/5 count and disables + Assign at limit with upgrade nudge | Free |
| Unassign items from vehicle loadout | ✅ | unassignAsset(), LoadoutSection | Free |
| **consumables** table + RLS | ✅ | asset_permissions | Free |
| Consumables tab: CRUD + qty tracking + stock alerts | ✅ | consumables table | Free (10 limit) |
| Sort modal + list/grid view toggle (Consumables) | ✅ | ConsumablesTab, AssetTile | Free |
| 80+ common presets (oils, fuels, coolants, welding, abrasives…) | ✅ | consumableTypes.js COMMON_CONSUMABLES | Free |
| Category-specific spec fields (viscosity, octane, DOT, ISO grade…) | ✅ | consumableTypes.js CATEGORY_SPECS | Free |
| ± stock adjustment inline on card | ✅ | adjustConsumableQty(), StockItemTab | Free |
| Cover photo selection (☆ Cover sets card thumbnail) | ✅ | VehiclesTab, ToolsTab, EquipmentTab, ConsumablesTab, MachineCard | Free |
| Photos for consumables (add via form, thumbnail in card, cover selection) | ✅ | ConsumablesTab, consumables table photos column | Free |
| Machine card collapsed header shows cover photo thumbnail | ✅ | MachineCard | Free |
| Low-stock / out-of-stock badge + overstock badge | ✅ | qtyLabel(), min_quantity / max_quantity thresholds | Free |
| Configurable min par (reorder point) and max par (ceiling) | ✅ | consumables.min_quantity, consumables.max_quantity | Free |
| Buy price / sell price / supplier / part number / location | ✅ | consumables.buy_price, sell_price, supplier, part_number, location | Free |
| Shared UI (StockItemTab) with Parts tab | ✅ | StockItemTab.jsx, tableType="consumable" | Free |
| Org provisioning for consumables | ✅ | asset_permissions, CompanySettings | Business |
| Assign org member to vehicle (VehicleMemberSection) | ✅ | getCompanyMembers(), assignAsset child_type='member', company prop | Business |

---

## 11. Team & Organisation

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| companies table + RLS | ✅ | profiles — run supabase/org_and_profiles_rls.sql; members read; admins update; _is_company_member / _is_company_admin SECURITY DEFINER helpers avoid asset_permissions recursion | Business |
| Create / edit company | ✅ | companies — run supabase/company_rpcs.sql (defines rpc_create_company SECURITY DEFINER: creates row, seeds caller as owner in company_members, links profile) | Business |
| Invite code join flow | ✅ | companies.invite_code — run supabase/company_rpcs.sql (defines join_company_by_invite SECURITY DEFINER: matches invite_code, inserts member row, links profile) | Business |
| company_members table | ✅ | companies, profiles — RLS: members read own company list; admins manage; users can leave (run supabase/org_and_profiles_rls.sql) | Business |
| Roles: owner / admin / technician / viewer | ✅ | company_members.role | Business |
| Edit member roles | ✅ | updateMemberRole() RPC | Business |
| Remove member | ✅ | removeMember() RPC — run supabase/delete_cascade_fixes.sql | Business |
| Delete company | ✅ | deleteCompany() → rpc_delete_company SECURITY DEFINER — run supabase/company_rpcs.sql; clears profiles.company_id for all members, removes asset_permissions, company_members, then company row (FK SET NULL handles machines/vehicles/etc.) | Business |
| Regenerate invite code | ✅ | regenerateInviteCode() RPC | Business |
| Company logo upload | ✅ | companies.logo (base64) | Business |
| Hourly rate / tax rate / currency config | ✅ | companies fields | Business |
| Machine provisioning panel (CompanySettings) | ✅ | machine_permissions | Business |
| Asset provisioning panel (vehicles/equip/tools) | ✅ | asset_permissions, CompanySettings | Business |

---

## 12. Wiki

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| wiki_entries table | ✅ | — | Free |
| wiki_revisions table | ✅ | wiki_entries | Enthusiast+ |
| Browse + search wiki | ✅ | wiki_entries — SELECT RLS: non-sample entries public; sample entries visible to owner only (run supabase/wiki_rls.sql); authors can delete their own public entries (run supabase/wiki_author_delete.sql) | Free |
| View count tracking | ✅ | wiki_entries.view_count | Free |
| Create / edit wiki entry | ✅ | wiki_entries | Enthusiast+ |
| Field-level editing with edit summary | ✅ | wiki_revisions | Enthusiast+ |
| Full revision history | ✅ | wiki_revisions | Enthusiast+ |
| Submit machine specs to wiki | ✅ | machines → wiki_entries | Enthusiast+ |
| Author attribution | ✅ | wiki_revisions.author_id | Enthusiast+ |
| Admin delete any wiki entry | ✅ | VITE_ADMIN_EMAIL env var check in WikiEntryPage, deleteWikiEntry() | Admin only |
| Per-user sample wiki entries (Honda GX200, Husqvarna 455 Rancher, Yamaha YZ250) | ✅ | seedSampleWikiEntries() in wiki.js — seeded on first wiki visit (gate: profiles.preferences.rat_wiki_seeded); each user gets their own copies (slug: {base}-sample-{uid8}); is_sample + sample_owner_id columns on wiki_entries; users see only their own samples + global non-sample entries; "Remove Sample" delete button on own samples; run supabase/wiki_sample_entries.sql first. Re-seed regression fix: WikiHomePage checks localStorage rat_wiki_seeded as fallback before seeding, migrates it to DB prefs and removes LS key on first load | Free |

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
| User preferences cross-device sync (sort, view, cols, active tab, tutorial flags) | ✅ | profiles.preferences JSONB + upsert_preference RPC — run supabase/preferences_migration.sql | Free |
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
