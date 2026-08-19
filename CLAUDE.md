# RAT BENCH — Claude Instructions

## Git workflow

- **"push to dev"** always means: `git push origin main:dev`
- Commit to `main` locally, then push `main → dev` on the remote.
- Never push to a different remote branch without explicit instruction.

## Commit messages

- Never include Claude attribution lines (`Co-Authored-By`, `Claude-Session`, or similar) in any commit message.

## Feature flags — every feature goes through the flag system

- Rat Bench has a launch-flags system (`supabase/launch_flags_admin.sql`, `supabase/user_feature_flags.sql`) with a global on/off per flag (Admin Panel → Flags tab) and a per-user override on top of it (Admin Panel → Users tab, per-user dropdown), so new functionality can be tested with a hand-picked group before it goes public.
- **Whenever you add new functionality, or touch existing functionality that isn't gated yet, add it to this flag system** — a row in `feature_flags` (via the Flags tab's "+ New Flag", or seeded in SQL like `wiki`/`marketplace`) plus a `useFeatureFlags()` check in the component(s) that render it, following the pattern already used for `flags.wiki`/`flags.marketplace` in `MachineCard.jsx`/`MachineForm.jsx`/`App.jsx`/`main.jsx`.
- The admin-panel plumbing (global toggle + per-user override dropdown) is automatic once the flag row exists — `src/lib/db/featureFlags.js`'s `getFeatureFlags()` and the Users tab's override dropdown both read whatever's in `feature_flags` dynamically, no hardcoded list to update. The only step that always needs doing by hand is wiring the actual feature's rendering to check its own flag.
- Don't do this for `member_cap` — it's a numeric cap, not an on/off feature, and is deliberately excluded from per-user overrides.
