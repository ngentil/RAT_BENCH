import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiHistoryPage from './WikiHistoryPage';

// Standalone router for wiki.ratbench.net
function WikiApp() {
  const [profile, setProfile] = useState(null);

  const raw = window.location.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const parts = raw.split("/");
  const slug = parts[0];
  const sub = parts[1];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) setProfile(data);
    });
  }, []);

  if (slug && sub === "history") return <WikiHistoryPage slug={slug} profile={profile} />;
  if (slug) return <WikiEntryPage slug={slug} profile={profile} />;
  return <WikiHomePage />;
}

export default WikiApp;
