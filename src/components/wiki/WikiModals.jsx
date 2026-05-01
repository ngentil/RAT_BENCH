import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BG, SURF, BRD, TXT, MUT, ACC, GRN, RED, inp, btnA, btnG, col, sm, ovly, mdl, mdlH, mdlB } from '../../lib/styles';
import { makeSlug, getWikiEntryBySlug, getWikiRevisions, deleteWikiEntry, deleteWikiRevision, saveWikiRevision, publishToWiki } from '../../lib/wiki';

export function WikiTrackerModal({machine,profile,onClose}){
  const [tab,setTab]=React.useState("publish");
  const [entry,setEntry]=React.useState(null);
  const [revisions,setRevisions]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [deleting,setDeleting]=React.useState(false);
  const m=machine;

  React.useEffect(()=>{
    (async()=>{
      const slug=makeSlug(m.make||"",m.model||"");
      const e=await getWikiEntryBySlug(slug);
      if(e){
        setEntry(e);
        const r=await getWikiRevisions(e.id);
        setRevisions(r||[]);
      }
      setLoading(false);
    })();
  },[]);

  const isOwner=entry&&profile&&entry.created_by===profile.id;
  const myRevs=revisions.filter(r=>r.edited_by===profile?.id);
  const hasContribs=isOwner||myRevs.length>0;

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:"4px 4px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setTab("publish")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="publish"?ACC:MUT,borderBottom:tab==="publish"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>PUBLISH</button>
            {hasContribs&&<button onClick={()=>setTab("manage")} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",background:"none",border:"none",cursor:"pointer",color:tab==="manage"?ACC:MUT,borderBottom:tab==="manage"?"2px solid "+ACC:"2px solid transparent",paddingBottom:2,fontFamily:"'IBM Plex Mono',monospace"}}>MANAGE</button>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:16}}>
          {tab==="publish"&&<PublishWikiModal machine={m} profile={profile} onClose={onClose} onPublished={onClose} inline/>}
          {tab==="manage"&&(
            loading?<div style={{fontSize:10,color:MUT}}>Loading…</div>:
            !entry?<div style={{fontSize:10,color:MUT}}>No wiki entry found for this machine.</div>:
            <div>
              <a href={"https://wiki.ratbench.net/"+makeSlug(m.make||"",m.model||"")} target="_blank" rel="noreferrer" style={{fontSize:10,color:ACC,display:"block",marginBottom:16}}>View on wiki ↗</a>
              {isOwner&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Delete Entire Entry</div>
                  <div style={{fontSize:10,color:MUT,marginBottom:8}}>Permanently removes this machine and all revisions from the wiki.</div>
                  <button disabled={deleting} onClick={async()=>{
                    if(!confirm(`Delete the entire wiki entry for ${m.make} ${m.model}? This cannot be undone.`))return;
                    setDeleting(true);
                    try{await deleteWikiEntry(entry.id);alert("Wiki entry deleted.");onClose();}
                    catch(e){alert(e.message);setDeleting(false);}
                  }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555"}}>
                    {deleting?"Deleting…":"🗑 Delete Entire Wiki Entry"}
                  </button>
                </div>
              )}
              {myRevs.length>0&&(
                <div>
                  <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>My Revisions ({myRevs.length})</div>
                  {myRevs.map(r=>(
                    <div key={r.id} style={{background:BG,border:"1px solid "+BRD,padding:"8px 12px",borderRadius:2,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <div>
                        <div style={{fontSize:10,color:TXT}}>{r.edit_summary||"No summary"}</div>
                        <div style={{fontSize:9,color:MUT}}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <button disabled={deleting} onClick={async()=>{
                        if(!confirm("Delete this revision?"))return;
                        setDeleting(true);
                        try{
                          await deleteWikiRevision(r.id,entry.id);
                          setRevisions(prev=>prev.filter(x=>x.id!==r.id));
                        }catch(e){alert(e.message);}
                        setDeleting(false);
                      }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555",flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PublishWikiModal({machine,profile,onClose,onPublished,inline}){
  const [step,setStep]=useState("loading");
  const [result,setResult]=useState(null);
  const [mergedData,setMergedData]=useState({});
  const [conflicts,setConflicts]=useState([]);
  const [picks,setPicks]=useState({});
  const [summary,setSummary]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const [publishedSlug,setPublishedSlug]=useState("");

  useEffect(()=>{
    publishToWiki(machine,profile).then(res=>{
      setResult(res);
      if(res.isNew){
        setSummary("Initial publish");
        setStep("confirm");
      } else {
        const wikiData=res.currentRevision?.data||{};
        const mine=res.specData;
        const cflcts=[];
        const auto={...wikiData};
        Object.keys(mine).forEach(k=>{
          const mv=mine[k],wv=wikiData[k];
          const hasM=mv!==null&&mv!==undefined&&mv!=="";
          const hasW=wv!==null&&wv!==undefined&&wv!=="";
          if(hasM&&hasW&&String(mv)!==String(wv)) cflcts.push({key:k,wiki:wv,mine:mv});
          else if(hasM&&!hasW) auto[k]=mv;
        });
        setConflicts(cflcts);
        const initPicks={};
        cflcts.forEach(c=>{initPicks[c.key]="wiki";});
        setPicks(initPicks);
        setMergedData(auto);
        setSummary("Merged specs from my machine");
        setStep(cflcts.length?"merge":"confirm");
      }
    }).catch(e=>{setErr(e.message);setStep("error");});
  },[]);

  const submit=async()=>{
    setBusy(true);setErr("");
    try{
      const finalData={...mergedData};
      conflicts.forEach(c=>{finalData[c.key]=picks[c.key]==="mine"?c.mine:c.wiki;});
      if(result.isNew){
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      } else {
        await saveWikiRevision(result.entry.id,{...result.currentRevision?.data,...finalData},summary,profile);
        await supabase.from("wiki_contributions").insert({entry_id:result.entry.id,machine_id:machine.id,user_id:profile.id});
      }
      setPublishedSlug(result.slug);
      setStep("done");
      onPublished&&onPublished(result.slug);
    }catch(e){setErr(e.message);}
    setBusy(false);
  };

  const lbl={fontSize:9,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4};

  const inner=(
    <>
      <div style={mdlH}>
        {!inline&&<b style={{fontSize:13,textTransform:"uppercase"}}>Publish to Wiki</b>}
        {!inline&&<button style={{...btnG,...sm}} onClick={onClose}>✕</button>}
      </div>
      <div style={mdlB}>
        {step==="loading"&&<div style={{textAlign:"center",padding:24,color:MUT,fontSize:11}}>Checking wiki…</div>}
        {step==="error"&&<>
          <div style={{fontSize:10,color:RED,marginBottom:12}}>{err}</div>
          <button onClick={onClose} style={{...btnG,...sm}}>Close</button>
        </>}
        {step==="done"&&<>
          <div style={{fontSize:13,color:GRN,marginBottom:8}}>✓ Published!</div>
          <div style={{fontSize:10,color:MUT,marginBottom:16}}>Your data is now live on the wiki.</div>
          <a href={`https://wiki.ratbench.net/${publishedSlug}`} target="_blank" rel="noreferrer"
            style={{...btnA,display:"inline-block",textDecoration:"none",fontSize:10,padding:"8px 14px"}}>
            View Wiki Page →
          </a>
        </>}
        {(step==="confirm"||step==="merge")&&<>
          {!result?.isNew&&<div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:2,padding:"8px 12px",fontSize:10,color:GRN,marginBottom:14}}>
            A wiki entry for <b>{machine.make} {machine.model}</b> already exists. Your data will be merged as a new revision.
          </div>}
          {result?.isNew&&<div style={{fontSize:10,color:MUT,marginBottom:14}}>
            Creating new wiki entry: <span style={{color:ACC,fontFamily:"monospace"}}>wiki.ratbench.net/{result?.slug}</span>
          </div>}
          {step==="merge"&&conflicts.length>0&&<>
            <div style={{fontSize:9,color:ACC,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>
              Conflicting Fields — pick which value to keep
            </div>
            <div style={{maxHeight:260,overflowY:"auto",marginBottom:14}}>
              {conflicts.map(c=>(
                <div key={c.key} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid "+BRD}}>
                  <div style={{...lbl,marginBottom:6}}>{c.key}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {[["wiki","Wiki: "+String(c.wiki)],["mine","Mine: "+String(c.mine)]].map(([val,label])=>(
                      <label key={val} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 8px",borderRadius:2,border:"1px solid "+(picks[c.key]===val?ACC:BRD),background:picks[c.key]===val?"#1a1200":"transparent"}}>
                        <input type="radio" name={c.key} checked={picks[c.key]===val} onChange={()=>setPicks(p=>({...p,[c.key]:val}))} style={{accentColor:ACC}}/>
                        <span style={{fontSize:10,color:picks[c.key]===val?TXT:MUT}}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>}
          <div style={{...col,marginBottom:12}}>
            <div style={lbl}>Edit Summary</div>
            <input style={inp} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Brief description of changes"/>
          </div>
          {err&&<div style={{fontSize:10,color:RED,marginBottom:10}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={submit} disabled={busy} style={{...btnA,...sm,opacity:busy?0.6:1}}>{busy?"Publishing…":"Publish"}</button>
            <button onClick={onClose} style={{...btnG,...sm}}>Cancel</button>
          </div>
        </>}
      </div>
    </>
  );
  if(inline) return inner;
  return <div style={ovly} onClick={onClose}><div style={{...mdl,maxWidth:480}} onClick={e=>e.stopPropagation()}>{inner}</div></div>;
}
