# RAT_BENCH — Feature Reference

Living document. Update this whenever a tab, feature, or restriction changes so future sessions don't need to trawl the code.

---

## Tiers

| Tier       | Price       | Machines | Org | ACL | Support |
|------------|-------------|----------|-----|-----|---------|
| free       | $0          | 30       | ✗   | ✗   | ✗       |
| enthusiast | $4.99/mo or $12/yr | ∞ | ✗  | ✗  | ✗       |
| team       | $29/mo      | ∞        | ✓   | ✓   | ✗       |
| business   | $99/mo      | ∞        | ✓   | ✓   | ✓       |

`effectiveTier(profile, company)` returns the highest tier between the user's own profile tier and their org's tier.  
Defined in `src/lib/gates.js`.

---

## Tabs

| Tab ID     | Label         | Component                                      | Visibility       | Free restriction                              |
|------------|---------------|------------------------------------------------|------------------|-----------------------------------------------|
| tracker    | 📋 Tracker    | `src/components/tracker/Tracker.jsx`           | All users        | 30 machine limit + banner                     |
| jobs       | 🗂 Jobs        | `src/components/tracker/JobBoard.jsx`          | All users        | Shows first 3 machines only; 1 machine full   |
| reminders  | 🔔 Remind      | `src/components/tracker/ServiceReminders.jsx`  | All users        | 1 reminder / 1 machine shown                  |
| revenue    | 📊 Revenue     | `src/components/tracker/RevenueDashboard.jsx`  | Enthusiast+ only | Full paywall screen (tab hidden for free)     |
| parts      | 🔩 Parts       | `src/components/tracker/PartsTab.jsx`          | All users        | 10 parts max + banner                         |
| clients    | 👤 Clients     | `src/components/customers/CustomersTab.jsx`    | Enthusiast+ only | Full paywall screen (tab hidden for free)     |
| search     | 🔍 Search      | `src/components/tracker/SpecSearch.jsx`        | All users        | No restriction                                |
| wiki       | 📖 Wiki        | `src/components/wiki/WikiTab.jsx`              | All users        | Read-only; banner blocks publishing           |
| vehicles   | 🚗 Vehicles    | `src/components/vehicles/VehiclesTab.jsx`      | All users        | 5 vehicles max + banner                       |
| equipment  | ⚙️ Equipment   | `src/components/equipment/EquipmentTab.jsx`    | All users        | 5 equipment items max + banner                |
| tools      | 🔧 Tools       | `src/components/tools/ToolsTab.jsx`            | All users        | 5 tools max + banner                          |
| users      | 👥 Users       | `src/components/users/UsersTab.jsx`            | Team+ only       | Tab hidden for free/enthusiast                |

Tab order and `enthusiastOnly`/`teamOnly` flags are defined in `src/lib/constants/ui.js`.

---

## Free Tier Banner Pattern

All tabs visible to free users follow this banner style (green-tinted box at top):

```jsx
{isFree && (
  <div style={{ background:"#0a1a0a", border:"1px solid #1a3a1a", borderRadius:2,
                padding:"10px 14px", marginBottom:14,
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
    <div>
      <div style={{ fontSize:9, color:"#4ade80", letterSpacing:"0.15em",
                    textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>
        Free Plan — [Feature] Preview
      </div>
      <div style={{ fontSize:10, color:MUT, lineHeight:1.6 }}>
        [Description of limit and what upgrade gives]
      </div>
    </div>
    {onGoToBilling && <button onClick={onGoToBilling} style={{...btnA,...sm,whiteSpace:"nowrap"}}>Upgrade →</button>}
  </div>
)}
```

---

## Asset Limits (src/lib/gates.js)

| Asset Type | Free | Enthusiast+ |
|------------|------|-------------|
| machines   | 30   | ∞           |
| tools      | 5    | ∞           |
| vehicles   | 5    | ∞           |
| equipment  | 5    | ∞           |
| parts      | 10   | ∞           |

Helper functions: `assetLimit(type, profile, company)`, `atAssetLimit(type, count, profile, company)`

---

## Org / Provisioning (Team+ only)

Provisioning lets org owners/admins grant team members access to assets.

| Asset Type | Permissions table    | CRUD location                |
|------------|---------------------|------------------------------|
| machines   | `machine_permissions` | `src/lib/db/machines.js`   |
| vehicles   | `asset_permissions`   | `src/lib/db/vehicles.js`   |
| equipment  | `asset_permissions`   | `src/lib/db/equipment.js`  |
| tools      | `asset_permissions`   | `src/lib/db/tools.js`      |

`asset_permissions` columns: `asset_type` ('vehicle'|'equipment'|'tool'), `asset_id`, `user_id`, `company_id`, `can_edit`.

Provisioning UI lives in `src/components/settings/CompanySettings.jsx` → `ProvisioningPanel`.

---

## Auth

- **Guest** (`is_anonymous: true`): 3 machine limit, shown "Create account" prompt. Cannot access billing, org features, or paid tabs.
- **Free** (logged-in, tier = "free"): Sees all tabs with restrictions per table above.
- **Enthusiast**: Unlimited personal assets, no org/ACL features.
- **Team / Business**: Org + ACL provisioning, shared asset library.

Auth flow: `src/components/auth/AuthScreen.jsx` → `OnboardingScreen.jsx` → main app.

---

## Stripe / Billing

- Price IDs loaded from env vars: `VITE_STRIPE_PRICE_ENTHUSIAST_MONTHLY`, `VITE_STRIPE_PRICE_ENTHUSIAST_YEARLY`, `VITE_STRIPE_PRICE_TEAM`, `VITE_STRIPE_PRICE_BUSINESS`
- Checkout: `supabase/functions/create-checkout/index.ts`
- Portal: `supabase/functions/create-portal/index.ts`
- Webhook (tier updates): `supabase/functions/stripe-webhook/index.ts`
- UI: `src/components/settings/BillingPage.jsx`

---

## Database Tables (Supabase)

| Table               | Purpose                                      |
|---------------------|----------------------------------------------|
| `profiles`          | User profile, tier, company_id, stripe IDs   |
| `companies`         | Org details, tier, stripe IDs, invite_code   |
| `company_members`   | user_id + company_id + role                  |
| `machines`          | Main workshop machine records (300+ cols)    |
| `machine_permissions` | Per-machine ACL for org members            |
| `vehicles`          | Fleet/personal vehicle records               |
| `equipment`         | Equipment inventory records                  |
| `tools`             | Tool inventory records (migrated from localStorage) |
| `asset_permissions` | Generic ACL for vehicles/equipment/tools     |
| `services`          | Machine service history entries              |
| `clients`           | Customer records                             |
| `announcements`     | In-app announcement banners                  |

---

## Key File Map

```
src/
  App.jsx                          Main router, session/data loading, tab bar
  lib/
    gates.js                       Tier definitions, feature gates, asset limits
    styles.js                      Global CSS-in-JS constants (colors, buttons, inputs)
    constants/
      ui.js                        TABS array, tile/badge/expand field configs
      machineTypes.js              28 machine type names
      countries.js                 Country list + tax label configs
    db/
      machines.js                  Machine CRUD + machine_permissions helpers
      vehicles.js                  Vehicle CRUD + asset_permissions helpers
      equipment.js                 Equipment CRUD + asset_permissions helpers
      tools.js                     Tool CRUD + asset_permissions helpers (Supabase)
      clients.js                   Client CRUD
      services.js                  Service history CRUD
      inventory.js                 Parts inventory (localStorage)
      transforms.js                DB ↔ app object mapping (machines only)
  components/
    auth/
      AuthScreen.jsx               Login / signup
      OnboardingScreen.jsx         New user profile setup
      GuestUpgradeModal.jsx        Guest → real account prompt
    tracker/
      Tracker.jsx                  Machine list/grid (main tab)
      JobBoard.jsx                 Job timer board
      ServiceReminders.jsx         Service due/overdue alerts
      RevenueDashboard.jsx         Revenue analytics (Enthusiast+)
      PartsTab.jsx                 Parts inventory (10-item free limit)
      SpecSearch.jsx               Cross-machine spec search
    machine/
      MachineCard.jsx              Expanded machine detail card
      MachineForm.jsx              Machine add/edit form (300+ fields)
      MachineTile.jsx              Grid tile view
    vehicles/
      VehiclesTab.jsx              Vehicle tracker (5-item free limit)
    equipment/
      EquipmentTab.jsx             Equipment tracker (5-item free limit)
    tools/
      ToolsTab.jsx                 Tool inventory (5-item free limit, Supabase-backed)
    customers/
      CustomersTab.jsx             Client list (Enthusiast+ only)
    wiki/
      WikiTab.jsx                  Community spec wiki
      WikiHomePage.jsx
      WikiEntryPage.jsx
    users/
      UsersTab.jsx                 Team member management (Team+ only)
    settings/
      SettingsPage.jsx             Settings shell (profile / company / billing tabs)
      ProfileSettings.jsx          Username, display name, units, password
      CompanySettings.jsx          Org details + provisioning panel
      BillingPage.jsx              Stripe plan cards
      AdminPanel.jsx               Super-admin panel (ratbenchadmin@gmail.com only)
    ui/
      shared.jsx                   SL, FL, Empty, SkullRating primitives
      PhotoAdder.jsx               Photo upload (base64)
supabase/
  functions/
    create-checkout/index.ts
    create-portal/index.ts
    stripe-webhook/index.ts
  clients_migration.sql
  add_parts_column.sql
  add_chipper_stump_columns.sql
  assets_migration.sql             vehicles, equipment, tools, asset_permissions
```
