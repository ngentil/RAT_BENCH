import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { subscribeSitePresence } from '../../lib/presence';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiHistoryPage from './WikiHistoryPage';
import WikiLeaderboard from './WikiLeaderboard';

function parsePath(pathname) {
  const raw = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  // decode %20 etc. — encoded slugs must match the DB slug column
  const parts = raw.split("/").map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  return { slug: parts[0], sub: parts[1] };
}

// Standalone router for wiki.ratbench.net
function WikiApp() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [onlineCount, setOnlineCount] = useState(null);
  // Tracked in state (not read fresh from window.location on every render) so
  // internal navigation can update it without a real page load — pressing
  // the phone/browser back button then just pops this state via popstate
  // instead of re-fetching the whole page, matching how the Tracker's
  // machine-tile back behaviour (MachineCard's cardOpen pushState) never
  // reloads either.
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Passed down to every page so their internal links (entry ↔ home ↔
  // history ↔ leaderboard) push real, shareable URLs without a full reload.
  const navigate = useCallback((to) => {
    if (to === window.location.pathname) return;
    history.pushState(null, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  const { slug, sub } = parsePath(path);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) return;
      setSession(s);
      const { data } = await supabase.from("profiles").select("*").eq("id", s.user.id).single();
      if (data) setProfile(data);
    });
  }, []);

  // One presence subscription per real page load, on the same shared channel
  // the main app's top bar uses — so "N online" is a single site-wide count
  // (public wiki visitors + logged-in app users together), not scoped to
  // just this page.
  useEffect(() => subscribeSitePresence(setOnlineCount), []);

  if (slug === "leaderboard") return <WikiLeaderboard onlineCount={onlineCount} onNavigate={navigate} />;
  if (slug && sub === "history") return <WikiHistoryPage slug={slug} session={session} profile={profile} onlineCount={onlineCount} onNavigate={navigate} />;
  if (slug) return <WikiEntryPage slug={slug} session={session} profile={profile} onlineCount={onlineCount} onNavigate={navigate} />;
  return <WikiHomePage onlineCount={onlineCount} onNavigate={navigate} />;
}

export default WikiApp;
