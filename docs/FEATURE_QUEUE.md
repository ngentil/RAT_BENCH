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

### Hydraulic Rams 🔥
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

### Tracked Machines / Ground Pressure
- Track width + ground contact length + machine weight → **ground pressure in kPa**
  - `GP = weight / (2 × width × contact_length)`
  - Compare and label it: "Less than a walking person (≈60 kPa)" / "Equivalent to a small car"
  - In imperial: PSI
- Smart Mode: pulls operating weight from machine specs automatically

### Tracked Machines / Undercarriage
- Track pitch × link count → **total track length per side** and both sides combined
  - e.g. 154mm × 47 links = 7.24m per side / 14.5m total
  - Useful when ordering replacement track
- Undercarriage hours + track type → **wear indicator**
  - Rubber tracks: 1,500–2,000h typical life / Steel tracks: 2,000–4,000h
  - Show as %: "2,400h on steel — ~80% of typical service life, start planning replacement"

### Tracked Machines / Hydraulic System
- System pressure vs relief valve setting → **safety margin**
  - Relief should sit 10–15% above operating pressure
  - Label: "40 bar margin — healthy" / "8 bar margin — tight, check setting" / "Relief at or below system pressure — fault"
  - The last case is a real technician miss — safety critical

### Mowers — Blade Tip Speed
- Blade length + engine RPM → **tip speed in m/s**
  - `v = π × blade_length × RPM / 60`
  - Label the result: "Optimal (270–290 m/s)" / "Too slow — may tear grass" / "Above safe limit"
  - In imperial: ft/s

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

### Engine — Mean Piston Speed
- Bore + stroke + WOT RPM → **mean piston speed in m/s**
  - `MPS = 2 × stroke × RPM / 60`
  - Label it: "Normal (<15 m/s)" / "Hot (15–20 m/s)" / "Race limit (>20 m/s)"
  - This is a benchmark race engine builders use — unknown to most people

### Engine — Rod Ratio
- Conrod length ÷ stroke → **rod ratio**
  - Label it: "<1.5 = short rod — peaky, aggressive" / "1.5–1.75 = balanced" / ">1.75 = long rod — smooth, linear"
  - Feels like insider knowledge


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

### Generator — Largest Motor It Can Start
- Generator kW rating → **max motor HP it can start**
  - Motors draw 6–8× running current on startup
  - `max_motor_hp = generator_kW / 6 × 1.341` (conservative, using 6× surge)
  - "This generator can reliably start a motor up to 0.8HP"
  - Very common question, no easy answer without this

### Fuel System — 2-Stroke Mix Oil Quantity
- Tank capacity + mix ratio → **oil to add per full tank**
  - `oil_ml = tank_litres × 1000 / ratio`
  - e.g. 5L tank at 50:1 = 100ml oil
  - "Add 100ml of 2-stroke oil per full tank"
  - In imperial: fl oz per gallon

### Pressure Washer — Cleaning Units
- PSI × flow (GPM or L/min) → **cleaning units (CU)**
  - CU = PSI × GPM
  - Label: "<1,500 CU = Light domestic" / "1,500–3,000 = Medium" / ">3,000 = Heavy duty"
  - Nobody knows this formula exists — total "aha" moment

### Tyres — Size Parser 🔥
- User types a tyre size string (e.g. `235/45R17`) → auto-parse into:
  - Section width (235mm)
  - Aspect ratio (45%)
  - Rim diameter (17")
  - Calculate: sidewall height, overall diameter, rolling circumference
  - In imperial: overall diameter in inches
  - "The magic field" — type one thing, five fields fill out

### Drivetrain — Overall Ratio & Top Speed
- Front sprocket + rear sprocket → **drive ratio**
  - Already have `frontSprocket` and `rearSprocket` fields
  - Smart Mode: chain pitch from chainsaw/drivetrain section
- Primary ratio × gearbox ratio × final drive → **total reduction**
  - "For every engine revolution, your wheel turns X times"
- Total reduction + wheel circumference + engine redline → **theoretical top speed**
  - In km/h or mph

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

### Client-Side Encryption (Notes & Photos)
- **Scope**: machine notes field + photos only — no other fields
- **Opt-in**: buried in user settings as an advanced/obscure toggle — not advertised
- **How it works**:
  - User enables the toggle → prompted to set a vault passphrase once
  - Browser derives AES-256-GCM key via PBKDF2 (Web Crypto API — no library needed)
  - Random salt generated on setup, stored in user profile (safe — useless without passphrase)
  - Notes + photos encrypted in browser before any save call — Supabase only ever stores ciphertext
  - Key lives in session memory only, never touches the server
  - On next login: passphrase prompt to unlock vault — can be skipped, notes show as 🔒 locked
  - Lose passphrase → data is gone, no recovery (true E2E, by design)
- **New files needed**:
  - `src/lib/crypto.js` — deriveKey, encryptText, decryptText, encryptPhoto helpers
  - `src/contexts/CryptoContext.jsx` — holds derived key in memory for the session
  - `VaultSetup` + `VaultUnlock` small modals
  - DB: add `encryptionSalt` column to user profile

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

### Firebase Migration
- Move from current backend to Firebase for real-time sync

---

## UX / Polish

- Smart Mode toggle visible on machine card (small icon, not buried in settings)
- Unit toggle in top-level user settings, reflected everywhere instantly
- Auto-calc fields have a distinct visual treatment (slightly dimmed, "⚡ calculated" badge)
- Cross-referenced fields show a small link icon indicating where the value came from
- Override any auto-calc field by tapping it — it becomes manual and shows "✏️ overridden"
