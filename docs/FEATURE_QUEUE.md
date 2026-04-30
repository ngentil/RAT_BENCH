# RAT BENCH — Feature Queue

Running log of queued features, ideas, and architectural decisions.
Chip away in any order — nothing here is urgent unless marked 🔥.

---

## Architecture Decisions (build these first, everything depends on them)

### Unit System
- Single `units: "metric" | "imperial"` flag stored in user profile settings
- All values stored internally in metric (mm, kg, kPa, kW, litres)
- Conversion is display-only via a shared formatter — never store imperial values
- Every calculated output respects the unit preference
- Affects: all auto-calc fields, all displayed specs

### Cross-Section Referencing
- Sections read from the shared `machine` object, not from each other directly
- e.g. Electrical load calculator reads `machine.lighting` — no circular imports
- As new sections are added (auxiliary, winch, fridge, etc.) their data becomes available to the load calculator automatically
- No special wiring needed per-section — it's always `machine.<section>`

### Smart Mode (per-machine toggle)
- Stored on the machine object: `smartMode: true | false`
- **Smart mode ON** — cross-section auto-population is active, calculated fields lock to their derived value with a small "auto" badge, user can override any field by tapping it
- **Smart mode OFF** — everything is manual, no cross-section reading, clean and simple for basic builds
- Default: OFF (don't surprise users on simple machines)
- A single mower owner and an excavator owner can coexist in the same account

---

## Auto-Calculating Fields

All of these must:
- Respect the unit system toggle (metric/imperial)
- Work in Smart Mode for cross-section referencing where applicable
- Be read-only display fields derived inline — never stored as their own database column

### Lighting (done ✅)
- Watts ÷ volts → amperage draw per light

### Hydraulic Rams (done ✅)
- Bore + pressure → **extend force** in tonnes/kN
  - Formula: `F = P × A` where `A = π/4 × bore²`
  - e.g. 60mm bore, 200 bar → 5.65t extend
- Bore + rod diameter + pressure → **retract force** (different because rod reduces effective area)
  - `A_retract = π/4 × (bore² - rod²)`
  - e.g. same ram with 40mm rod → 4.27t retract
  - Display both: "Extend: 5.6t / Retract: 4.3t"
- Bore + stroke → **oil volume per full cycle** in litres
  - `V = π/4 × bore² × stroke`
  - "Each full stroke consumes 1.4L of hydraulic oil"
- Pump flow (L/min) + system pressure → **hydraulic power in kW**
  - `P = Q × p / 600`

### Tracked Machines / Ground Pressure (done ✅)
- Track width + ground contact length + machine weight → ground pressure in kPa

### Tracked Machines / Undercarriage (done ✅)
- Track pitch × link count → total track length per side + both sides combined
- Undercarriage hours + track type → wear indicator as % of typical service life

### Tracked Machines / Hydraulic System (done ✅)
- System pressure vs relief valve setting → safety margin with colour-coded fault label

### Mowers — Blade Tip Speed (done ✅)
- Blade length + WOT RPM → tip speed in m/s with Optimal / Too slow / Above limit label

### Engine — Compression & Fuel Octane (done ✅)
- Compression ratio → minimum fuel octane recommendation

### Engine — Bore/Stroke Ratio (done ✅)
- Bore ÷ stroke → character label (over-square / square / under-square)

### Electrical — Cold Cranking Watts (done ✅)
- Battery voltage × CCA → cold cranking watts

### Electrical — Battery Energy (done ✅)
- Battery voltage × Ah → watt-hours

### Generator — Amps Output (done ✅)
- Generator watts ÷ generator voltage → amps output

### Engine — Mean Piston Speed (done ✅)
- Stroke + WOT RPM → mean piston speed in m/s with Normal / Hot / Race limit label

### Engine — Rod Ratio (done ✅)
- Conrod length ÷ stroke → rod ratio with Short / Balanced / Long label


### Electrical — Wire Voltage Drop
- Wire gauge + run length + current draw → **voltage drop in V**
  - Use resistivity table per gauge (stored as a constant, not user data)
  - "Your 10m run of 6mm² cable drops 0.8V at 30A"
  - Flag if drop >0.5V (problematic) or >1V (significant issue)
  - In imperial: AWG gauge, feet

### Electrical — Net Charge Rate (Smart Mode)
- Total accessory load (W) + alternator output (W) → **net charge rate**
  - Smart Mode: pulls accessory load from `machine.lighting` amps + future auxiliary sections
  - Manual mode: user enters total load manually
  - Output: "Surplus: 120W — battery charging while driving" / "Deficit: 80W — battery draining"
  - Show estimated time to drain battery at current deficit (needs battery Ah)

### Generator — Largest Motor It Can Start (done ✅)
- Generator kW → max motor HP it can start (6× surge allowance)

### Fuel System — 2-Stroke Mix Oil Quantity (done ✅)
- Tank capacity + mix ratio → ml of oil to add per full tank

### Pressure Washer — Cleaning Units (done ✅)
- PSI × flow (LPM) → cleaning units with Light / Medium / Heavy duty label

### Tyres — Size Parser (done ✅)
- User types a tyre size string (e.g. `235/45R17`) → auto-parse into:
  - Section width (235mm)
  - Aspect ratio (45%)
  - Rim diameter (17")
  - Calculate: sidewall height, overall diameter, rolling circumference
  - In imperial: overall diameter in inches
  - "The magic field" — type one thing, five fields fill out

### Drivetrain — Final Drive Ratio (done ✅)
- Front + rear sprocket teeth → ratio:1 label with "rear wheel turns once per X engine revolutions"

### Drivetrain — Total Reduction + Top Speed (queued)
- Primary ratio × gearbox ratio × final drive → total reduction
- Total reduction + wheel circumference + redline → theoretical top speed in km/h

### Suspension — Static Sag
- Spring rate + rider/vehicle weight → **recommended static sag range**
  - Motocross standard: sag = 95–105mm (varies by discipline)
  - "At 80kg and a 95 N/mm spring, target sag is 28–32mm"
  - Setup knowledge people pay suspension tuners for

---

## Smart Mode — Cascade Calculations (future, needs multiple sections complete)

These only become possible once the referenced sections exist:

- **Total electrical load** = lighting amps + auxiliary amps + winch peak draw + fridge draw → feeds net charge rate calc
- **Total operating weight** = dry weight + fuel weight (tank capacity × fuel density) + hydraulic oil volume + operator weight → feeds ground pressure calc
- **Service countdown** = last service date + interval + hours logged → next service due, % of service life used
- **Fuel cost per hour** = fuel consumption rate + current fuel price (user-entered) → running cost display

---

## New Sections / Machine Types

### Outboard Motors (added to machine types ✅)
- Needs its own spec fields: shaft length, transom height, prop pitch, prop diameter, gear ratio, fuel type, break-in hours
- Cooling: raw water (self-cooling) — different to other engines
- Tilt/trim: hydraulic or manual

### Suspension (expansion)
- Spring rates front/rear
- Damper brand/model
- Ride height
- Castor/camber settings
- Links to sag calculator above

### Exhaust
- Brand, pipe diameter, header length, collector size
- 2-stroke: expansion chamber specs (calculated power band)

### Clutch (expansion beyond current)
- Friction plate thickness (worn vs new)
- Spring pressure
- Engagement RPM (already exists for 2-stroke)

---

## App-Level Features

### Photos — Migrate to Supabase Storage
- Currently photos are stored as base64 strings inside the database row — expensive and slow
- Each photo ≈ 300KB in the DB, 10 photos per machine ≈ 3MB
- Free tier burns through 500MB fast once users are photo-heavy
- **Fix**: store photos in Supabase Storage (object storage), save URLs in the DB row instead
- Storage free tier = 1GB, Pro = 100GB — far cheaper per MB, purpose-built for it
- Will also make the app faster — images load from CDN not from a DB query
- Needs: upload helper in `src/lib/storage.js`, update PhotoAdder to upload + return URL, update MachineCard/MachineForm to read URLs instead of base64

### Serial Numbers / VINs
- Dedicated field with format validation per machine type
- VIN decoder for vehicles (17-char check)

### Service Reminders
- Push notification or in-app banner when service is due
- Based on date interval, hour interval, or both (whichever comes first)

### Parts List
- Per-machine list of commonly replaced parts with part numbers
- Link to filter/plug/belt specs already logged in the form

### Labour Tracking
- Log time against jobs
- Hourly rate → job cost summary

### Invoice / Quote PDF Export
- Based on job board entries + parts + labour
- Separate from the machine spec PDF export

### Firebase Migration (planned)
- Move from Supabase to Firebase/Firestore for real-time sync + single Google backend
- Firebase gives: Firestore (DB), Firebase Storage (photos), Firebase Auth, Hosting, FCM (push notifications), Functions (Stripe webhooks), Analytics — all one console, one bill
- Do this after core features are stable

---

## UX / Polish

- Smart Mode toggle visible on machine card (small icon, not buried in settings)
- Unit toggle in top-level user settings, reflected everywhere instantly
- Auto-calc fields have a distinct visual treatment (slightly dimmed, "⚡ calculated" badge)
- Cross-referenced fields show a small link icon indicating where the value came from
- Override any auto-calc field by tapping it — it becomes manual and shows "✏️ overridden"

---

## Monetisation Tiers (locked ✅)

| Tier | Price | Users | Key features |
|------|-------|-------|-------------|
| **Free** | $0 | 1 | Unlimited machines, read-only wiki |
| **Enthusiast** | $4.99/mo or **$12/yr** | 1 | Wiki editing, for-sale tags on machines, PDF export, private notes |
| **Team** | **$29/mo flat** | up to 10 | ACL/provisioning, shared job board, all Enthusiast features |
| **Business** | $99/mo flat | Unlimited | Everything, priority support |

**Pricing rationale:**
- Flat fee (not per-seat) for Team — eliminates decision friction at signup, incentivises inviting the whole team
- Enthusiast annual ($12/yr) is the hook for hobbyists — cheaper than a coffee, feels like nothing
- Wiki editing gated at Enthusiast — gives the feature real perceived value and a reason to upgrade
- For-sale tags: contact info only, no marketplace, no transaction handling

**What needs building for monetisation:**
- Stripe integration (subscription billing)
- Tier enforcement in Supabase RLS / app logic
- Upgrade prompts at feature gates (wiki edit, PDF export, add team member)
- General Terms of Service page (required before charging anyone)
- Billing management page (view plan, cancel, upgrade/downgrade)

---

## Security & Access Control

### Machine-Level Permissions (ACL)
- Modelled on Linux read/write/execute — three independent toggles per user per machine:
  - **Visible** — machine appears in their list at all
  - **Read** — can open and see full specs, photos, notes
  - **Write** — can edit the machine
- A user can be visible+read+write, visible+read only, visible only (knows it exists, can't open it), or not visible at all

**Role hierarchy:**
- **Owner** — unrestricted, sees everything always, cannot be restricted by anyone
- **Admin** — elevated defaults, but owner controls their ACL per machine exactly like any other user
- **User** — ACL controlled by whoever manages them, limited to machines that person can themselves see
- Rule: you cannot grant access you don't have — if a machine is hidden from an admin, that admin cannot see or manage the ACL for it either

**Provisioning flow:**
- Owner creates machine → invisible to everyone by default
- Owner clicks **Provision** → works through org member list, assigns visible/read/write per person
- Can provision directly to a user, bypassing admin entirely — admin can't see that assignment
- Can provision to admin to cascade down to their users
- Admin provisions machines they can see to their users — can only grant up to what they themselves have
- Owner can override admin — grant a user permissions the admin doesn't have or even doesn't know about
- ACL is the single source of truth — everything flows from owner down

**What needs building:**
- `machine_permissions` table — `machine_id`, `user_id`, `can_view`, `can_read`, `can_write`
- Provision UI — per machine, scrollable list of org members each with three toggles
- Query layer — only return machines the requesting user has `can_view` permission for
- General Terms of Service page for the app (needed before monetisation)

