// Launch-mode toggles — Rat Bench is launching as a purely free garage/
// workshop tool with no paywalls and no community features, so this app can
// get real users on a solid foundation before Wiki/Marketplace/paid seats
// come back. Every feature this file gates stays fully intact in code (SQL,
// Stripe edge functions, UI) — nothing was deleted. Each flag below is
// independent on purpose (per product decision, not a single master switch)
// so any one of them can flip back on later without dragging the others
// with it. Flipping one back to its original value is the entire "re-enable
// this feature" step on the client side; the matching SQL side of each is
// called out in its own comment below.

// Invoices: normally capped at 5/company/month, with a $20/mo add-on for
// unlimited (see supabase/invoice_addon_billing.sql). true = uncapped and
// free for everyone, same as Quotes always have been. The actual cap
// enforcement lives in check_and_use_invoice_credit() — see
// supabase/launch_free_invoices.sql, which layers a bypass on top of it the
// same way inventory_recently_deleted.sql layers onto recently_deleted.sql
// rather than editing the original file in place.
export const INVOICES_FREE = true;

// Wiki: hidden from the Community tab entirely, and the public
// wiki.ratbench.net app (src/main.jsx) refuses to render its content while
// this is true. Note: this only blocks it at the application layer — actual
// DNS/subdomain-level blocking of wiki.ratbench.net (so the hostname doesn't
// resolve at all) is infrastructure/hosting configuration outside this
// codebase and needs to be handled separately if wanted.
export const WIKI_HIDDEN = true;

// Marketplace: hidden from the Community tab, and the public /marketplace +
// /listing/:id routes (src/main.jsx) refuse to render while this is true.
// Messages has no purpose independent of Marketplace (every thread requires
// a marketplace_listings row — see supabase/marketplace_messaging.sql), so
// it's hidden alongside Marketplace rather than getting its own flag.
export const MARKETPLACE_HIDDEN = true;

// Seats: normally a brand-new company starts at 0 paid seats (owner works
// free, but even one teammate requires paying — see
// supabase/company_billing.sql). Seat *purchasing* is hidden at launch, and
// every company gets this many free seats beyond the owner regardless of
// what they've actually paid for. Set to 0 to fully restore the original
// paid-only behavior once seat billing comes back (purchase UI would also
// need un-hiding at each of its call sites). The server-side floor lives in
// supabase/launch_free_seats.sql, which redefines join_company_by_invite()
// to check GREATEST(paid_seats, this number) instead of paid_seats alone —
// keep this constant in sync with that file's _free_seat_cap() if changed.
export const FREE_SEAT_CAP = 10;
