import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import WikiApp from './components/wiki/WikiApp';
import PublicMachinePage from './components/tracker/PublicMachinePage';
import { installBackGuard } from './lib/backGuard';
import ErrorBoundary from './components/ui/ErrorBoundary';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
});

const pathParts = window.location.pathname.split('/');
const publicMachineId = pathParts[1] === 'm' && pathParts[2] ? pathParts[2] : null;
const isWiki = window.location.hostname === "wiki.ratbench.net";

// Install before React renders so the sentinel is at the bottom of the history stack.
if (!isWiki && !publicMachineId) installBackGuard();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp /> : publicMachineId ? <PublicMachinePage machineId={publicMachineId} /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
