import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, inp, btnA, btnG, btnD, col, dvdr } from '../../lib/styles';
import WikiLoginBar from './WikiLoginBar';
function WikiEntryPage({slug,profile}){
  const [entry,setEntry]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [notFound,setNotFound]=React.useState(false);
  const [editing,setEditing]=React.useState(false);
  const [form,setForm]=React.useState({});
  const [summary,setSummary]=React.useState("");
  const [saving,setSaving]=React.useState(false);
  const [saveErr,setSaveErr]=React.useState("");
  const [revisions,setRevisions]=React.useState([]);
  const [showManage,setShowManage]=React.useState(false);
  const [deleting,setDeleting]=React.useState(false);

  React.useEffect(()=>{
    (async()=>{
      const e=await getWikiEntryBySlug(slug);
      if(!e){setNotFound(true);}
      else{
        setEntry(e);
        incrementViewCount(e.id);
        if(profile) getWikiRevisions(e.id).then(r=>setRevisions(r||[]));
      }
      setLoading(false);
    })();
  },[slug,profile]);

  const startEdit=()=>{
    const d=entry.currentRevision?.data||{};
    setForm(Object.fromEntries(Object.keys(WIKI_FIELD_LABELS).map(k=>[k,d[k]??entry[k]??""])));
    setSummary("");setSaveErr("");setEditing(true);
  };

  const doSave=async()=>{
    if(!summary.trim()){setSaveErr("Edit summary required.");return;}
    setSaving(true);setSaveErr("");
    try{
      const rev=await saveWikiRevision(entry.id,form,summary,profile);
      setEntry(e=>({...e,currentRevision:rev}));
      setEditing(false);
    }catch(e){setSaveErr(e.message);}
    setSaving(false);
  };

  if(loading) return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:10,color:MUT,fontFamily:"'IBM Plex Mono',monospace"}}>Loading…</div>
    </div>
  );

  if(notFound) return(
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
      <div style={{fontSize:11,color:MUT}}>Entry not found.</div>
      <a href="/" style={{fontSize:10,color:ACC}}>← Back to wiki</a>
    </div>
  );

  const revData=entry.currentRevision?.data||{};
  const fields=Object.entries(WIKI_FIELD_LABELS).filter(([k])=>{const v=revData[k]??entry[k];return v!=null&&v!=="";});
  const inp={width:"100%",boxSizing:"border-box",background:BG,border:"1px solid "+BRD,color:TXT,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,padding:"5px 8px",borderRadius:2,outline:"none"};

  return(
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🐀</span>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>{entry.make} {entry.model}</div>
          <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>Rat Bench Wiki</div>
        </div>
        <a href="/" style={{fontSize:9,color:MUT,textDecoration:"none",letterSpacing:"0.06em"}}>← Wiki</a>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:10,color:MUT}}>{entry.view_count||0} views</div>
          <div style={{display:"flex",gap:8}}>
            <a href={"/"+slug+"/history"} style={{fontSize:9,color:MUT,textDecoration:"none",border:"1px solid "+BRD,padding:"4px 8px"}}>History</a>
            {profile
              ? editing
                ? <button onClick={()=>setEditing(false)} style={{...btnG,...sm,fontSize:9}}>Cancel</button>
                : <button onClick={startEdit} style={{...btnG,...sm,fontSize:9,borderColor:ACC,color:ACC}}>Edit</button>
              : null
            }
          </div>
        </div>

        {editing?(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {Object.entries(WIKI_FIELD_LABELS).map(([k,label])=>(
                <div key={k}>
                  <div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{label}</div>
                  <input value={form[k]||""} onChange={ev=>setForm(f=>({...f,[k]:ev.target.value}))} style={inp}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:8,color:MUT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Edit Summary *</div>
              <input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="What did you change?" style={{...inp,width:"100%"}}/>
            </div>
            {saveErr&&<div style={{fontSize:10,color:RED,marginBottom:8}}>{saveErr}</div>}
            <button onClick={doSave} disabled={saving} style={{...btnG,fontSize:10,background:ACC,color:BG,border:"none",padding:"8px 20px"}}>
              {saving?"Saving…":"Save"}
            </button>
          </div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {fields.map(([k,label])=>(
                <div key={k} style={{background:SURF,border:"1px solid "+BRD,padding:"8px 12px",borderRadius:2}}>
                  <div style={{fontSize:8,color:MUT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:12,color:TXT}}>{String(revData[k]??entry[k])}</div>
                </div>
              ))}
            </div>
            {fields.length===0&&<div style={{fontSize:10,color:MUT,textAlign:"center",marginTop:40}}>No spec data yet.</div>}
          </>
        )}

        {/* Manage section — only for contributors */}
        {profile&&(()=>{
          const isOwner=entry.created_by===profile.id;
          const myRevs=revisions.filter(r=>r.edited_by===profile.id);
          if(!isOwner&&myRevs.length===0) return null;
          return(
            <div style={{marginTop:24,borderTop:"1px solid "+BRD,paddingTop:16}}>
              <button onClick={()=>setShowManage(m=>!m)} style={{...btnG,...sm,fontSize:9,marginBottom:showManage?12:0}}>
                {showManage?"▲ Hide":"▼ Manage My Contributions"}
              </button>
              {showManage&&(
                <div>
                  {isOwner&&(
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Delete Entire Entry</div>
                      <button disabled={deleting} onClick={async()=>{
                        if(!confirm("Delete this entire wiki entry and all its revisions? This cannot be undone."))return;
                        setDeleting(true);
                        try{await deleteWikiEntry(entry.id);window.location="/";}
                        catch(e){alert(e.message);setDeleting(false);}
                      }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555"}}>
                        {deleting?"Deleting…":"🗑 Delete Entire Entry"}
                      </button>
                    </div>
                  )}
                  {myRevs.length>0&&(
                    <div>
                      <div style={{fontSize:9,color:MUT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>My Revisions</div>
                      {myRevs.map(r=>(
                        <div key={r.id} style={{background:SURF,border:"1px solid "+BRD,padding:"8px 12px",borderRadius:2,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
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
                              const updated=await getWikiEntryBySlug(slug);
                              if(updated)setEntry(updated);
                            }catch(e){alert(e.message);}
                            setDeleting(false);
                          }} style={{...btnG,fontSize:9,color:"#e05555",borderColor:"#e05555",flexShrink:0}}>
                            🗑 Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
export default WikiEntryPage;