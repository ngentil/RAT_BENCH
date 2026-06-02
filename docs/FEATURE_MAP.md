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
| Guest upgrade modal | ✅ | auth | Free |
| Profiles table + RLS | ✅ | auth.users | Free |
| Tier system (`gates.js`) | ✅ | profiles.tier | All |
| Stripe Checkout (3 plans: Free / Enthusiast $3.50wk / Pro $10wk) | ✅ | Stripe, profiles | All |
| Stripe webhook → tier update | ✅ | Stripe, profiles/companies | All |
| Billing portal (manage/cancel) | ✅ | Stripe customer ID | All |
| Announcements (in-app banners) | ✅ | profiles.tier | All |
| Machines RLS (own + provisioned policies) | ✅ | scalability_hardening.sql | All |
| DB-level machine limit trigger (free=30, guest=3) | ✅ | scalability_hardening.sql, profiles.tier | Free |
| Critical DB indexes (machines, services, bookings, permissions) | ✅ | scalability_hardening.sql | All |
| Checkout rate-limit (blocks duplicate Stripe sessions) | ✅ | create-checkout edge fn | All |
| Sentry error tracking | ✅ | VITE_SENTRY_DSN env var | All |
| Preconnect hints (Fonts + Supabase dns-prefetch) | ✅ | index.html | All |
| Non-blocking announcements fetch (deferred after first paint) | ✅ | App.jsx IIFE after setInitializing | All |
| Service worker / PWA static asset cache (repeat-visit perf) | ✅ | vite-plugin-pwa, dist/sw.js | All |

---

## 2. Machine Tracker (core)

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machines table (200+ columns, RLS) | ✅ | profiles, companies | Free |
| Create / edit / delete machine | ✅ | machines table, transforms.js | Free |
| Machine form (all 200+ spec fields) | ✅ | machines, machineTypes constants | Free |
| List view + grid view | ✅ | machines, MachineTile, MachineCard | Free |
| Search, sort, filter by status | ✅ | machines | Free |
| Drag-to-reorder | ✅ | machines | Free |
| Machine limit enforcement (30 free) | ✅ | gates.js, machines count | Free |
| Configurable tile fields + colours | ✅ | machines, ui.js constants | Free |
| Configurable expand sections | ✅ | machines, ui.js constants | Free |
| PDF spec sheet export | ✅ | machines, jspdf | Free |
| Machine → client linking | ✅ | machines, clients table | Enthusiast+ |
| Machine → company tagging | ✅ | machines, companies | Team+ |
| Real-time sync (org machines) | ✅ | Supabase channel, company_id | Team+ |
| "Shared" badge on provisioned machines | ✅ | machine_permissions | Team+ |
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
| machine_permissions table + RLS | ✅ | machines, company_members | Team+ |
| getMachines() returns provisioned machines | ✅ | machine_permissions | Team+ |
| Provisioning panel in CompanySettings | ✅ | machine_permissions, company_members | Team+ |
| Grant View / Grant Edit / Revoke per member | ✅ | machine_permissions | Team+ |
| Read-only machine card for View-only members | ✅ | machine_permissions, can_edit flag | Team+ |

---

## 4. Service Tracking

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| services table + RLS | ✅ | machines | Free |
| Log service entry (date, types, notes) | ✅ | services table | Free |
| Spark plug photo log | ✅ | services, photos (base64) | Free |
| Job photos per service | ✅ | services, photos | Free |
| Oil change interval (hrs or months) | ✅ | machines.oil_change_interval | Free |
| Major service interval (hrs or months) | ✅ | machines.major_service_interval | Free |
| Overdue / due-soon badge in tab bar | ✅ | getMachineServiceStatus() helper | Free |
| Progress bar (green → red) | ✅ | service intervals, last service date | Free |
| Service history timeline on machine card | ✅ | services table | Free |

---

## 5. Storage Policy

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| machine_bookings table + RLS | ✅ | machines, auth.users | Enthusiast+ |
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
| Job timer (start / stop / pause) | ✅ | machines.job_timer (jsonb) | Free |
| Multiple timers per machine | ✅ | machines.job_timer array | Free |
| Timer sync: lock when another member running | ✅ | job_timer.startedBy, Realtime | Team+ |
| Time log (save sessions with label + notes) | ✅ | machines.time_log (jsonb) | Free |
| Running timer badge in Jobs tab | ✅ | machines.job_timer status | Free |
| Invoice generation (labour + parts) | ✅ | time_log, inventory, company rates | Free |
| Parts markup on invoice | ✅ | inventory buy/sell price | Free |
| Tax calculation on invoice | ✅ | companies.tax_rate, tax_label | Team+ |
| Invoice number auto-increment | ✅ | invoices.js RPC + localStorage fallback | Free |
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
| Tax deduction display | ✅ | companies.tax_rate | Team+ |
| Currency formatting | ✅ | companies.currency | Team+ |

---

## 8. Parts & Inventory

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| inventory_items table + RLS | ✅ | profiles | Free |
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
| asset_permissions table + RLS | ✅ | auth.users, company_members | Team+ |
| **vehicles** table + RLS | ✅ | asset_permissions | Free |
| Vehicles tab: CRUD + service log + photos | ✅ | vehicles table | Free (3 limit) |
| Vehicle service log: full ServiceModal (types, datetime, plug photo, job photos, edit) | ✅ | ServiceModal, VehiclesTab | Free |
| Sort modal + list/grid view toggle (Vehicles) | ✅ | VehiclesTab, AssetTile | Free |
| **equipment** table + RLS | ✅ | asset_permissions | Free |
| Equipment tab: CRUD + service log + photos | ✅ | equipment table | Free (3 limit) |
| Sort modal + list/grid view toggle (Equipment) | ✅ | EquipmentTab, AssetTile | Free |
| **tools** table + RLS | ✅ | asset_permissions | Free |
| Tools tab: CRUD + warranty + loan tracking | ✅ | tools table | Free (3 limit) |
| Sort modal + list/grid view toggle (Tools) | ✅ | ToolsTab, AssetTile | Free |
| localStorage → Supabase migration (tools) | ✅ | tools table | — |
| Free-tier item limit (3 per type) | ✅ | gates.js assetLimit() | Free |
| Upgrade banner at limit | ✅ | atAssetLimit() | Free |
| Org provisioning (grant/revoke per member) | ✅ | asset_permissions, CompanySettings | Team+ |
| **asset_assignments** table + RLS (replaces vehicle_assignments for cross-type) | ✅ | asset_assignments_migration.sql | Free |
| All-to-all cross-assignment (vehicle/tool/equipment/consumable/part) | ✅ | asset_assignments, LoadoutSection | Free |
| Forward loadout panel (Assigned Items + picker) | ✅ | LoadoutSection, VehiclesTab, ToolsTab, EquipmentTab, ConsumablesTab | Free |
| Parts (inventory items) assignable via Loadout picker | ✅ | getInventoryItems() wrapper, LoadoutSection | Free |
| Reverse lookup panel (Assigned To) | ✅ | getAssignedIn(), LoadoutSection | Free |
| Unassign items from loadout | ✅ | unassignAsset(), LoadoutSection | Free |
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
| Org provisioning for consumables | ✅ | asset_permissions, CompanySettings | Team+ |
| Assign org member to vehicle (VehicleMemberSection) | ✅ | getCompanyMembers(), assignAsset child_type='member', company prop | Team+ |

---

## 11. Team & Organisation

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| companies table + RLS | ✅ | profiles | Team+ |
| Create / edit company | ✅ | companies | Team+ |
| Invite code join flow | ✅ | companies.invite_code, RPC | Team+ |
| company_members table | ✅ | companies, profiles | Team+ |
| Roles: owner / admin / technician / viewer | ✅ | company_members.role | Team+ |
| Edit member roles | ✅ | updateMemberRole() RPC | Team+ |
| Remove member | ✅ | removeMember() RPC | Team+ |
| Regenerate invite code | ✅ | regenerateInviteCode() RPC | Team+ |
| Company logo upload | ✅ | companies.logo (base64) | Team+ |
| Hourly rate / tax rate / currency config | ✅ | companies fields | Team+ |
| Machine provisioning panel (CompanySettings) | ✅ | machine_permissions | Team+ |
| Asset provisioning panel (vehicles/equip/tools) | ✅ | asset_permissions, CompanySettings | Team+ |

---

## 12. Wiki

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| wiki_entries table | ✅ | — | Free |
| wiki_revisions table | ✅ | wiki_entries | Enthusiast+ |
| Browse + search wiki | ✅ | wiki_entries | Free |
| View count tracking | ✅ | wiki_entries.view_count | Free |
| Create / edit wiki entry | ✅ | wiki_entries | Enthusiast+ |
| Field-level editing with edit summary | ✅ | wiki_revisions | Enthusiast+ |
| Full revision history | ✅ | wiki_revisions | Enthusiast+ |
| Submit machine specs to wiki | ✅ | machines → wiki_entries | Enthusiast+ |
| Author attribution | ✅ | wiki_revisions.author_id | Enthusiast+ |
| Admin delete any wiki entry | ✅ | VITE_ADMIN_EMAIL env var check in WikiEntryPage, deleteWikiEntry() | Admin only |

---

## 12. Navigation & UX

| Feature | Status | Depends on | Tier |
|---------|--------|-----------|------|
| 🔨 Workshop parent tab (nested sub-tab bar) | ✅ | App.jsx, WORKSHOP_TABS constant | Free |
| Workshop sub-tabs: Parts, Clients, Tools, Vehicles, Equipment, Consumables, Revenue | ✅ | WORKSHOP_TABS, App.jsx content panels | Free / Ent+ |
| Free-tier Workshop banner (5-item limit nudge + upgrade link) | ✅ | effectiveTier(), Workshop tab | Free |
| Revenue sub-tab gated behind Enthusiast+ | ✅ | WORKSHOP_TABS enthusiastOnly flag | Enthusiast+ |
| Per-user Workshop tab visibility preferences | ✅ | profiles.tab_order.workshop_visible (Supabase), TabOrderSettings.jsx checkboxes | Free |
| Per-user Workshop default sub-tab | ✅ | First visible tab in ordered workshop list (implicit, no separate setting) | Free |
| Workshop visibility + order UI under Settings → ⇅ Tabs | ✅ | TabOrderSettings.jsx WorkshopReorderList (checkboxes + ↑/↓ + DEFAULT badge) | Free |
| Users tab moved into Settings (team/business only) | ✅ | SettingsPage, UsersTab | Team+ |
| localStorage migration (old flat tab IDs → workshop sub-tabs) | ✅ | App.jsx init state | Free |
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
| Smart Mode cascade calculations | 📋 | Needs multiple sections complete |
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
