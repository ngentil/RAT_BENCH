import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import WikiApp from './components/wiki/WikiApp';
import ErrorBoundary from './components/ui/ErrorBoundary';

const isWiki = window.location.hostname === "wiki.ratbench.net";
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isWiki ? <WikiApp /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
