import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT } from '../../lib/styles';
import WikiLoginBar from './WikiLoginBar';
import WikiHomePage from './WikiHomePage';
import WikiEntryPage from './WikiEntryPage';
import WikiHistoryPage from './WikiHistoryPage';
function WikiApp(){
  const [profile,setProfile]=React.useState(null);
  const raw=window.location.pathname.replace(/^\/+/,"").replace(/\/+$/,"");
  const parts=raw.split("/");
  const slug=parts[0];
  const sub=parts[1];

  const loadProfile=async()=>{
    const{data:{session}}=await supabase.auth.getSession();
    if(!session){setProfile(null);return;}
    const{data}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
    setProfile(data||null);
  };

  React.useEffect(()=>{
    loadProfile();
    const{data:{subscription}}=supabase.auth.onAuthStateChange(()=>loadProfile());
    return()=>subscription.unsubscribe();
  },[]);

  const header=<WikiLoginBar profile={profile} onLogin={loadProfile} onLogout={async()=>{await supabase.auth.signOut();setProfile(null);}}/>;

  if(slug&&sub==="history") return <>{header}<WikiHistoryPage slug={slug}/></>;
  if(slug) return <>{header}<WikiEntryPage slug={slug} profile={profile}/></>;
  return <>{header}<WikiHomePage/></>;
}

export default WikiApp;