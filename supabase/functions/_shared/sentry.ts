// Shared Sentry init for edge functions — a silently-failing Stripe webhook
// or checkout call is arguably worse than a client-side UI glitch (it can
// mean someone paid and never got upgraded), so these get the same error
// reporting the browser app already has, not just console.error into
// Supabase's own log viewer where nobody's watching.
//
// Requires the SENTRY_DSN secret set on the project (same DSN as
// VITE_SENTRY_DSN, or a separate one if you want edge-function errors kept
// in a distinct Sentry project — either works, this just reads whichever
// DSN is configured under this name):
//   supabase secrets set SENTRY_DSN=https://...@sentry.io/...
//
// Prefix `_` keeps this out of Supabase's function-per-folder deploy
// discovery — it's a shared module, not its own function.
import * as Sentry from "npm:@sentry/deno@^7.114.0";

let initialized = false;

export function initSentry(functionName: string) {
  if (initialized) return Sentry;
  const dsn = Deno.env.get("SENTRY_DSN");
  Sentry.init({
    dsn,
    enabled: !!dsn,
    environment: "supabase-edge-functions",
    tracesSampleRate: 0,
  });
  Sentry.setTag("function", functionName);
  // Defensive net for anything that escapes the handler's own try/catch.
  addEventListener("unhandledrejection", (event) => {
    Sentry.captureException(event.reason);
  });
  initialized = true;
  return Sentry;
}
