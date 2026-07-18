import React, { useState, useEffect, useCallback } from 'react';
import PublicMarketplaceHome from './PublicMarketplaceHome';
import PublicListingPage from './PublicListingPage';

function parsePath(pathname) {
  const raw = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const parts = raw.split("/").map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  return { listingId: parts[0] === 'listing' && parts[1] ? parts[1] : null };
}

// Standalone router for the public Marketplace pages (/marketplace,
// /listing/:id) on the main domain — mirrors WikiApp.jsx's pattern so
// internal navigation (home ↔ listing) pushes real, shareable URLs without
// a full page reload; pressing the phone/browser back button then just pops
// this state instead of re-fetching the whole page, same as the Tracker's
// machine-tile back behaviour (MachineCard's cardOpen pushState).
function PublicMarketplaceApp() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    if (to === window.location.pathname) return;
    history.pushState(null, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  const { listingId } = parsePath(path);

  return listingId
    ? <PublicListingPage listingId={listingId} onNavigate={navigate} />
    : <PublicMarketplaceHome onNavigate={navigate} />;
}

export default PublicMarketplaceApp;
