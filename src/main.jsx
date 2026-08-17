import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import WikiApp from './components/wiki/WikiApp';
import PublicMachinePage from './components/tracker/PublicMachinePage';
import PublicMarketplaceApp from './components/marketplace/PublicMarketplaceApp';
import { installBackGuard } from './lib/backGuard';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { getFeatureFlags } from './lib/db/featureFlags';

// Rendered instead of WikiApp/PublicMarketplaceApp while their launch flag
// is on — deliberately inert (no nav, no data fetch, nothing to mount) so
// wiki.ratbench.net / /marketplace / /listing/:id stay genuinely blocked at
// the application layer, not just hidden from in-app nav. Actual DNS/
// subdomain-level blocking of wiki.ratbench.net is outside this codebase.
function NotAvailable() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#eee',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Mono',monospace",padding:24,textAlign:'center'}}>
      <div>
        <div style={{fontSize:20,fontWeight:700,color:'#e8670a',marginBottom:8}}>Not available right now</div>
        <div style={{fontSize:12,color:'#888'}}>This part of Rat Bench isn't live yet.</div>
      </div>
    </div>
  );
}

// vite-plugin-pwa's default auto-injected registration (now disabled via
// injectRegister:false in vite.config.js) forces window.location.reload()
// the instant a newly-deployed service worker activates — including mid-
// session, e.g. with a machine card open. The new worker still installs
// and activates in the background exactly as before (registerType stays
// 'autoUpdate'); a no-op onNeedReload just stops it from yanking the user
// into an unannounced reload. The updated code takes effect naturally the
// next time the page is actually reloaded/reopened, same as any normal
// site update.
registerSW({ immediate: true, onNeedReload() {} });

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Set at build time from the deploy's git commit (see vite.config.js) so
  // errors in Sentry can be grouped/filtered by which deploy introduced them
  // — without this every error looks like it's from "unknown release".
  release: import.meta.env.VITE_RELEASE || undefined,
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
});

const pathParts = window.location.pathname.split('/').map(p => { try { return decodeURIComponent(p); } catch { return p; } });
const publicMachineId = pathParts[1] === 'm' && pathParts[2] ? pathParts[2] : null;
const isWikiHost = window.location.hostname === "wiki.ratbench.net";
const isMarketplacePath = pathParts[1] === 'marketplace' || (pathParts[1] === 'listing' && pathParts[2]);
// Legal pages are plain documents — hijacking Back with the exit toast there
// traps users who arrived from the auth screen. Note this doesn't depend on
// the wiki/marketplace launch flags at all — a wiki.ratbench.net or
// /marketplace URL skips the backGuard either way, whether it ends up
// rendering the real app or the blocked NotAvailable page below, so this
// stays a synchronous decision even though which component to mount for
// those two paths now needs an async flag fetch first.
const isPublicPage = isWikiHost || publicMachineId || isMarketplacePath
  || ['/terms', '/privacy', '/data-retention'].includes(window.location.pathname.replace(/\/+$/, ''));

// Install before React renders so the sentinel is at the bottom of the history stack.
if (!isPublicPage) installBackGuard();

const root = ReactDOM.createRoot(document.getElementById('root'));

if (isWikiHost || isMarketplacePath) {
  // Only these two routes need to know a launch flag before deciding what
  // to mount — DB-backed now (see supabase/launch_flags_admin.sql), so this
  // one case needs an async fetch first. Every other path (the default
  // <App/>, a public machine page, a legal page) renders synchronously
  // below exactly as before, unaffected by this.
  getFeatureFlags().then(flags => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          {isWikiHost
            ? (flags.wiki ? <WikiApp /> : <NotAvailable />)
            : (flags.marketplace ? <PublicMarketplaceApp /> : <NotAvailable />)}
        </ErrorBoundary>
      </React.StrictMode>
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        {publicMachineId ? <PublicMachinePage machineId={publicMachineId} /> : <App />}
      </ErrorBoundary>
    </React.StrictMode>
  );
}
