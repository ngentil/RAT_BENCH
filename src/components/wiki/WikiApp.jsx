import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiHistoryPage from './WikiHistoryPage';

// Standalone router for wiki.ratbench.net
function WikiApp() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);

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

  if (slug && sub === "history") return <WikiHistoryPage slug={slug} session={session} profile={profile} />;
  if (slug) return <WikiEntryPage slug={slug} session={session} profile={profile} />;
  return <WikiHomePage />;
}

export default WikiApp;
