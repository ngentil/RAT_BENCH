import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { initAnalytics } from './lib/analytics';
import './index.css';
import App from './App';
import WikiApp from './components/wiki/WikiApp';
import ErrorBoundary from './components/ui/ErrorBoundary';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
});

initAnalytics();

const isWiki = window.location.hostname === "wiki.ratbench.net";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
