import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import WikiApp from './components/wiki/WikiApp';
import PublicMachinePage from './components/tracker/PublicMachinePage';
import PublicListingPage from './components/marketplace/PublicListingPage';
import PublicMarketplaceHome from './components/marketplace/PublicMarketplaceHome';
import { installBackGuard } from './lib/backGuard';
import ErrorBoundary from './components/ui/ErrorBoundary';

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
const publicListingId = pathParts[1] === 'listing' && pathParts[2] ? pathParts[2] : null;
const isMarketplaceHome = pathParts[1] === 'marketplace' && !pathParts[2];
const isWiki = window.location.hostname === "wiki.ratbench.net";
// Legal pages are plain documents — hijacking Back with the exit toast there
// traps users who arrived from the auth screen.
const isLegalPage = ['/terms', '/privacy', '/data-retention'].includes(window.location.pathname.replace(/\/+$/, ''));
const isPublicPage = isWiki || publicMachineId || publicListingId || isMarketplaceHome || isLegalPage;

// Install before React renders so the sentinel is at the bottom of the history stack.
if (!isPublicPage) installBackGuard();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp />
        : publicListingId ? <PublicListingPage listingId={publicListingId} />
        : isMarketplaceHome ? <PublicMarketplaceHome />
        : publicMachineId ? <PublicMachinePage machineId={publicMachineId} />
        : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
