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
import { WIKI_HIDDEN, MARKETPLACE_HIDDEN } from './lib/launchFlags';

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
const isWiki = isWikiHost && !WIKI_HIDDEN;
const isMarketplacePublic = isMarketplacePath && !MARKETPLACE_HIDDEN;
const isBlockedCommunityRoute = (isWikiHost && WIKI_HIDDEN) || (isMarketplacePath && MARKETPLACE_HIDDEN);
// Legal pages are plain documents — hijacking Back with the exit toast there
// traps users who arrived from the auth screen.
const isLegalPage = ['/terms', '/privacy', '/data-retention'].includes(window.location.pathname.replace(/\/+$/, ''));
const isPublicPage = isWiki || publicMachineId || isMarketplacePublic || isLegalPage || isBlockedCommunityRoute;

// Install before React renders so the sentinel is at the bottom of the history stack.
if (!isPublicPage) installBackGuard();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp />
        : isMarketplacePublic ? <PublicMarketplaceApp />
        : publicMachineId ? <PublicMachinePage machineId={publicMachineId} />
        : isBlockedCommunityRoute ? <NotAvailable />
        : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
