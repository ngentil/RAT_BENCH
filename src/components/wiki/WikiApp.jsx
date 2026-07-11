import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { subscribeSitePresence } from '../../lib/presence';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiHistoryPage from './WikiHistoryPage';
import WikiLeaderboard from './WikiLeaderboard';

// Standalone router for wiki.ratbench.net
function WikiApp() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [onlineCount, setOnlineCount] = useState(null);

  const raw = window.location.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  // decode %20 etc. — encoded slugs must match the DB slug column
  const parts = raw.split("/").map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  const slug = parts[0];
  const sub = parts[1];

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

  if (slug === "leaderboard") return <WikiLeaderboard onlineCount={onlineCount} />;
  if (slug && sub === "history") return <WikiHistoryPage slug={slug} session={session} profile={profile} onlineCount={onlineCount} />;
  if (slug) return <WikiEntryPage slug={slug} session={session} profile={profile} onlineCount={onlineCount} />;
  return <WikiHomePage onlineCount={onlineCount} />;
}

export default WikiApp;
