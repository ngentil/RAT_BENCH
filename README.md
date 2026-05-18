# 🐀 Rat Bench

**The workshop management app for small engine and equipment repair shops.**

Rat Bench is built for the one- or two-person shop that fixes what everyone else throws away — chainsaws, lawnmowers, outboard motors, quad bikes, pressure washers, generators, and everything in between. It replaces the whiteboard, the paper job cards, the spreadsheet of parts, and the sticky note reminders with a single fast tool that runs in the browser.

---

## The Problem

Small workshop owners juggle a lot with almost no back-office support:

- **No central machine history.** Every time a machine comes back in, you're starting from scratch — "what plug does this take again?" "when did we last do the carb?" You rely on memory or a pile of old job cards you can't search.
- **Jobs fall through the cracks.** When you've got eight machines in the shop at once and you're the mechanic, the parts runner, and the person answering the phone, things get missed.
- **Invoicing is painful.** Labour hours live in your head, parts are scratched on a notepad, and building an invoice means opening a spreadsheet or Word doc and doing it manually every single time.
- **No idea where anything is.** Which trailer is out with who? Where's the spare bar oil? Did we order more air filters? What tools did we send out with that hire machine?
- **Reminders don't exist.** Service intervals pass without warning. You only find out a machine is overdue when the customer brings it back.

---

## What Rat Bench Does

### Machine Tracker
The core of the app. Every machine that comes into your shop gets a record with its full spec — engine size, fuel system, plug type, tyre sizes, deck size, compression, and 200+ other fields depending on the machine type. That record travels with the machine forever, so you never have to look up the same thing twice.

- **Service history** — log every oil change, plug replacement, and major service with photos
- **Service interval tracking** — set oil change and major service intervals in hours or months; the app tells you what's overdue and what's coming up
- **Job timers** — start a timer when you pick up a machine, pause it, stop it; labour hours are tracked automatically
- **Invoice generation** — when the job's done, generate an invoice with labour, parts, and tax in one click
- **Machine photos** — photo log for before/after, plug condition, damage documentation

### Workshop
Everything in your workshop, tracked in one place under a single tab.

- **Parts & Inventory** — stock levels, buy/sell pricing, min-stock alerts, QR code labels, barcode scanner support
- **Consumables** — oils, fuels, coolants, filters, welding wire, abrasives — with stock levels, low-stock warnings, and category-specific spec fields (viscosity, DOT rating, ISO grade, etc.)
- **Tools** — warranty tracking, loan tracking (who's got what)
- **Vehicles** — your utes, trailers, and fleet
- **Equipment** — lifts, welders, compressors, specialty tools
- **Clients** — customer records linked to their machines, with invoicing history and per-client invoice export

### Revenue Dashboard
See what the shop is actually making — labour revenue, parts revenue, and gross profit — broken down by week, month, or custom period, with a per-machine breakdown.

### Storage Billing
Track machines left in the shop past collection day. Configurable storage tiers with daily rates, automatic fee accrual, free-period grace days, and escalation alerts when a machine needs to be moved on. Storage fees roll into the client invoice automatically.

### Team & Organisation
Multiple users on the same account — assign machines and assets to specific techs, control who can view vs edit, manage your team from one admin account.

### Spec Wiki
A searchable reference database of machine specs — plug types, tyre sizes, oil capacities, torque specs — that any user can contribute to from their own machine records.

---

## Who It's For

Rat Bench is built specifically for:

- **Small engine repair shops** — the person fixing chainsaws, mowers, and generators out the back
- **Equipment hire businesses** — tracking what's out, what's in, and what needs servicing
- **Mobile mechanics** — keeping machine history and job records on the go
- **Enthusiasts** — anyone running multiple machines who wants a proper spec and service log

It is not trying to be a full ERP or replace accounting software. It's the thing you use at the bench, on your phone, while your hands are covered in grease.

---

## Tiers

| | Free | Enthusiast | Team | Business |
|---|---|---|---|---|
| Machines | 30 | Unlimited | Unlimited | Unlimited |
| Tools / Vehicles / Equipment | 5 each | Unlimited | Unlimited | Unlimited |
| Revenue dashboard | — | ✓ | ✓ | ✓ |
| Storage billing | — | ✓ | ✓ | ✓ |
| Client management | ✓ | ✓ | ✓ | ✓ |
| Multi-user org | — | — | ✓ | ✓ |
| Priority support | — | — | — | ✓ |

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend / DB:** Supabase (Postgres + Row Level Security + Auth)
- **Payments:** Stripe
- **Styling:** IBM Plex Mono, inline styles — no UI framework