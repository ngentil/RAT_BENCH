# RAT BENCH — Feature Reference

Quick-reference for all tabs, features, tier gates, and free-tier limits.
Update this file whenever a tab or gated feature is added or changed.

---

## Tier Ladder

| Tier        | Price         | Machine limit | Org / ACL | Priority support |
|-------------|---------------|---------------|-----------|-----------------|
| Free        | $0            | 30            | ✗         | ✗               |
| Enthusiast  | $4.99/mo or $12/yr | ∞        | ✗         | ✗               |
| Team        | $29/mo        | ∞             | ✓         | ✗               |
| Business    | $99/mo        | ∞             | ✓         | ✓               |

Gate logic lives in `src/lib/gates.js` (`TIERS`, `effectiveTier`, `canUse`, `machineLimit`, `atMachineLimit`).

---

## Tabs

Tabs are defined in `src/lib/constants/ui.js` (`TABS` array).
Tab-bar filtering happens in `src/App.jsx` (checks `enthusiastOnly` and `teamOnly` flags).

| Tab ID      | Label        | Component                                      | Visible to free? | Free restriction                                 |
|-------------|--------------|------------------------------------------------|------------------|--------------------------------------------------|
| `tracker`   | 📋 Tracker   | `src/components/tracker/Tracker.jsx`           | ✓                | 30-machine limit + "Free Plan" banner            |
| `jobs`      | 🗂 Jobs      | `src/components/tracker/JobBoard.jsx`          | ✓                | First 3 machines only; 1 machine has full access |
| `reminders` | 🔔 Remind    | `src/components/tracker/ServiceReminders.jsx`  | ✓                | 1 reminder / 1 machine shown                     |
| `revenue`   | 📊 Revenue   | `src/components/tracker/RevenueDashboard.jsx`  | ✗ (hidden)       | Tab hidden (`enthusiastOnly`); hard paywall inside |
| `parts`     | 🔩 Parts     | `src/components/tracker/PartsTab.jsx`          | ✓                | 10 parts max + "Free Plan — Parts Preview" banner |
| `clients`   | 👤 Clients   | `src/components/customers/CustomersTab.jsx`    | ✗ (hidden)       | Tab hidden (`enthusiastOnly`); hard paywall inside |
| `search`    | 🔍 Search    | `src/components/tracker/SpecSearch.jsx`        | ✓                | No restriction                                   |
| `wiki`      | 📖 Wiki      | `src/components/wiki/WikiTab.jsx`              | ✓                | Read-only; publishing requires Enthusiast        |
| `tools`     | 🔧 Tools     | `src/components/tools/ToolsTab.jsx`            | ✓                | 5 tools max + "Free Plan" banner                 |
| `vehicles`  | 🚗 Vehicles  | `src/components/vehicles/VehiclesTab.jsx`      | ✓                | 5 vehicles max + "Free Plan" banner              |
| `equipment` | ⚙️ Equipment | `src/components/equipment/EquipmentTab.jsx`    | ✓                | 5 equipment items max + "Free Plan" banner       |
| `users`     | 👥 Users     | `src/components/users/UsersTab.jsx`            | ✗ (hidden)       | Tab hidden (`teamOnly`)                          |
| `settings`  | ⚙️ Settings  | `src/components/settings/SettingsPage.jsx`     | ✓                | No restriction                                   |

---

## Free-Tier Limit Constants

| Feature         | Limit | Where enforced                                    |
|-----------------|-------|---------------------------------------------------|
| Machines        | 30    | `src/lib/gates.js` → `atMachineLimit()`           |
| Guest machines  | 3     | `src/components/tracker/Tracker.jsx`              |
| Jobs (machines) | 3     | `src/components/tracker/JobBoard.jsx` `FREE_LIMIT`|
| Reminders       | 1 machine / 1 item | `src/components/tracker/ServiceReminders.jsx` |
| Parts           | 10    | `src/components/tracker/PartsTab.jsx` `FREE_PARTS_LIMIT` |
| Tools           | 5     | `src/lib/gates.js` → `assetLimit('tool', ...)`    |
| Vehicles        | 5     | `src/lib/gates.js` → `assetLimit('vehicle', ...)` |
| Equipment       | 5     | `src/lib/gates.js` → `assetLimit('equipment', ...)`|

---

## Free-Tier Banner Pattern

All tabs visible to free users show a consistent top banner when the user is on the free plan:

```jsx
{isFree && (
  <div style={{ background:"#0a1a0a", border:"1px solid #1a3a1a", borderRadius:2,
    padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center",
    justifyContent:"space-between", gap:12 }}>
    <div>
      <div style={{ fontSize:9, color:"#4ade80", letterSpacing:"0.15em",
        textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>
        Free Plan
      </div>
      <div style={{ fontSize:10, color:MUT, lineHeight:1.6 }}>
        {restriction description}
      </div>
    </div>
    {onGoToBilling && (
      <button onClick={onGoToBilling} style={{ ...btnA, ...sm, whiteSpace:"nowrap" }}>
        Upgrade →
      </button>
    )}
  </div>
)}
```

---

## Org Provisioning (Team+ only)

Provisioning UI lives in `src/components/settings/CompanySettings.jsx` (`ProvisioningPanel`).

| Asset type  | Permission table      | DB helpers (file)                  |
|-------------|-----------------------|------------------------------------|
| Machines    | `machine_permissions` | `src/lib/db/machines.js`           |
| Vehicles    | `asset_permissions`   | `src/lib/db/vehicles.js`           |
| Equipment   | `asset_permissions`   | `src/lib/db/equipment.js`          |
| Tools       | `asset_permissions`   | `src/lib/db/tools.js`              |

`asset_permissions` schema: `(id, asset_type, asset_id, user_id, company_id, can_edit)`.

---

## Data Storage

| Asset       | Storage              | Migration file                          |
|-------------|----------------------|-----------------------------------------|
| Machines    | Supabase `machines`  | Core table (pre-existing)               |
| Services    | Supabase `services`  | Core table (pre-existing)               |
| Clients     | Supabase `clients`   | `supabase/clients_migration.sql`        |
| Parts       | localStorage         | `rat_inventory_{uid}`                   |
| Tools       | Supabase `tools`     | `supabase/assets_migration.sql`         |
| Vehicles    | Supabase `vehicles`  | `supabase/assets_migration.sql`         |
| Equipment   | Supabase `equipment` | `supabase/assets_migration.sql`         |

> Parts is still localStorage-backed (`src/lib/db/inventory.js`).

---

## Auth & Roles

- **Auth methods:** Email/password, Google OAuth, Anonymous (guest)
- **Guest limit:** 3 machines; nudged to create account via `GuestUpgradeModal`
- **Org roles:** `owner` / `admin` / `technician` / `viewer` (stored in `company_members.role`)
- **Platform super-admin:** `ratbenchadmin@gmail.com` (hardcoded check in `AdminPanel.jsx`)

---

## Billing / Stripe

- Checkout: `supabase/functions/create-checkout/index.ts`
- Portal: `supabase/functions/create-portal/index.ts`
- Webhooks: `supabase/functions/stripe-webhook/index.ts`
- Price env vars: `VITE_STRIPE_PRICE_ENTHUSIAST_MONTHLY`, `_YEARLY`, `_TEAM`, `_BUSINESS`
- On success, frontend polls `profiles` table for tier update (8 × 2 s)

---

## Key Files Quick-Reference

| Purpose              | File                                                   |
|----------------------|--------------------------------------------------------|
| Tier gates           | `src/lib/gates.js`                                     |
| Tab definitions      | `src/lib/constants/ui.js`                              |
| Global styles        | `src/lib/styles.js`                                    |
| App router / tabs    | `src/App.jsx`                                          |
| DB transforms        | `src/lib/db/transforms.js`                             |
| Machine CRUD         | `src/lib/db/machines.js`                               |
| User / org CRUD      | `src/lib/db/users.js`                                  |
| Vehicles CRUD        | `src/lib/db/vehicles.js`                               |
| Equipment CRUD       | `src/lib/db/equipment.js`                              |
| Tools CRUD           | `src/lib/db/tools.js`                                  |
| Parts CRUD           | `src/lib/db/inventory.js` (localStorage)               |
| Billing UI           | `src/components/settings/BillingPage.jsx`              |
| Org provisioning UI  | `src/components/settings/CompanySettings.jsx`          |
| Team management UI   | `src/components/users/UsersTab.jsx`                    |
