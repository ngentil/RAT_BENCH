import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, btnG } from '../../lib/styles';
function WikiHistoryPage({slug}){
  const [revs,setRevs]=React.useState([]);
  const [entry,setEntry]=React.useState(null);
  const [loading,setLoading]=React.useState(true);

  React.useEffect(()=>{
    (async()=>{
      const e=await getWikiEntryBySlug(slug);
      if(e){
        setEntry(e);
        const r=await getWikiRevisions(e.id);
        setRevs(r);
      }
      setLoading(false);
    })();
  },[slug]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:10,color:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>Loading…</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🐀</span>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>{entry?`${entry.make} ${entry.model}`:"History"}</div>
          <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>Revision History</div>
        </div>
        <a href={"/"+slug} style={{fontSize:9,color:MUT,textDecoration:"none",letterSpacing:"0.06em"}}>← Entry</a>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 16px"}}>
        {revs.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",marginTop:40}}>No revisions yet.</div>}
        {revs.map((r,i)=>(
          <div key={r.id} style={{background:SURF,border:"1px solid "+BRD,padding:"12px 16px",borderRadius:2,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div>
                <div style={{fontSize:11,color:TXT,marginBottom:3}}>{r.edit_summary||"No summary"}</div>
                <div style={{fontSize:9,color:MUT}}>{r.username||"unknown"}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {i===0&&<div style={{fontSize:8,color:ACC,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Current</div>}
                <div style={{fontSize:9,color:MUT}}>{new Date(r.created_at).toLocaleDateString()}</div>
                <div style={{fontSize:9,color:MUT}}>{new Date(r.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default WikiHistoryPage;