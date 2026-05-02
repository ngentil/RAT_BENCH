import React, { useState, useEffect, useRef } from 'react';
import { ACC, MUT, BRD2, TXT, dvdr, empt, btnG, sm } from '../../lib/styles';
import { RAGE_LBL } from '../../lib/constants';

export function SL({t}){ return <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ACC,marginBottom:8}}>{t}</div>; }
export function FL({t}){ return <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:MUT,marginBottom:4}}>{t}</div>; }
export function Divider(){ return <div style={dvdr} />; }
export function Empty({t}){ return <div style={empt}>{t}</div>; }

export function Tooltip({text,children,pos="top"}){
  const [vis,setVis]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!vis)return;
    const close=(e)=>{if(ref.current&&!ref.current.contains(e.target))setVis(false);};
    document.addEventListener("pointerdown",close);
    return()=>document.removeEventListener("pointerdown",close);
  },[vis]);
  const above=pos!=="bottom";
  return (
    <div ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:3}}>
      {children}
      <span
        onMouseEnter={()=>setVis(true)} onMouseLeave={()=>setVis(false)}
        onClick={e=>{e.stopPropagation();setVis(v=>!v)}}
        style={{color:MUT,fontSize:9,cursor:"pointer",userSelect:"none",opacity:0.6,flexShrink:0,lineHeight:1}}>ⓘ</span>
      {vis&&<div style={{position:"absolute",[above?"bottom":"top"]:"calc(100% + 5px)",left:0,maxWidth:"min(240px,calc(100vw - 32px))",background:"rgba(14,14,14,0.96)",border:"1px solid #2a2a2a",borderRadius:2,padding:"7px 10px",fontSize:9,color:"#ccc",whiteSpace:"normal",zIndex:9999,letterSpacing:"0.05em",lineHeight:1.6,fontFamily:"'IBM Plex Mono',monospace",boxShadow:"0 4px 16px rgba(0,0,0,0.7)"}}>{text}</div>}
    </div>
  );
}

export function SkullRating({value,onChange}){
  const [hov,setHov]=useState(0);
  const d=hov||value||0;
  return (
    <div>
      <FL t="Rage Factor" />
      <div style={{display:"flex",gap:2,alignItems:"center"}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onClick={()=>onChange(n===value?0:n)} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"1px",opacity:n<=d?1:0.15}}>☠️</button>
        ))}
        {value>0&&<span style={{fontSize:9,color:MUT,marginLeft:4,fontFamily:"'IBM Plex Mono',monospace"}}>{RAGE_LBL[value]}</span>}
      </div>
    </div>
  );
}

export function SpecCell({label,value,highlight}){
  return (
    <div style={{background:"#0d0d0d",border:"1px solid "+(highlight?"#3a2200":BRD2),borderRadius:2,padding:"6px 9px"}}>
      <div style={{fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",color:highlight?ACC:MUT,marginBottom:2}}>{label}</div>
      <div style={{fontSize:11,color:highlight?"#e8a060":TXT,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    </div>
  );
}

export function SummaryCard({lines,onEdit}){
  const filtered=lines.filter(l=>l&&l.trim());
  return (
    <div style={{background:"#0d0d0d",border:"1px solid #252525",borderRadius:2,padding:"10px 12px",marginBottom:4}}>
      {filtered.map((l,i)=><div key={i} style={{fontSize:11,color:TXT,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.7,marginBottom:i<filtered.length-1?2:8}}>{l}</div>)}
      <button onClick={onEdit} style={{...btnG,...sm}}>Edit</button>
    </div>
  );
}

export function NotLogged({onAdd}){
  return (
    <div style={{padding:"10px 0 14px 0"}}>
      <div style={{fontSize:10,color:MUT,marginBottom:8,fontStyle:"italic"}}>Not logged yet</div>
      <button onClick={onAdd} style={{...btnG,...sm}}>+ Add</button>
    </div>
  );
}
