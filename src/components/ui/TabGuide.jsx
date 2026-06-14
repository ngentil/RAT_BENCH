import React, { useState } from 'react';

const ARW = "#e8870a";
const M = { fontFamily:"'IBM Plex Mono',monospace" };

const UpRightArrow = () => (
  <svg className="arrow-guide" width="62" height="54" viewBox="0 0 62 54">
    <path d="M 8 51 C 14 35, 32 18, 54 8" stroke={ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" />
    <path d="M 49 4 L 56 9 L 51 15" stroke={ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownArrow = () => (
  <svg className="arrow-guide" width="30" height="42" viewBox="0 0 30 42" style={{ marginTop:8 }}>
    <path d="M 15 4 C 20 16, 11 25, 15 36" stroke={ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" />
    <path d="M 11 32 L 15 38 L 19 32" stroke={ARW} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// variant "add"  → right-aligned, arrow up-right toward + Add button
// variant "info" → centered, arrow down toward content below
export default function TabGuide({ storageKey, title, lines, variant = "add" }) {
  const [done, setDone] = useState(() => localStorage.getItem(storageKey) === '1');
  if (done) return null;
  const dismiss = () => { localStorage.setItem(storageKey, '1'); setDone(true); };

  if (variant === "add") {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", paddingBottom:10, userSelect:"none" }}>
        <UpRightArrow />
        <span style={{ ...M, fontSize:12, color:ARW, fontWeight:700, marginTop:4 }}>{title}</span>
        {lines.map((l, i) => (
          <span key={i} style={{ ...M, fontSize:9, color:"#666", marginTop:i===0?4:2 }}>{l}</span>
        ))}
        <button onClick={dismiss} style={{ ...M, marginTop:10, background:"none", border:"none", color:"#333", fontSize:10, cursor:"pointer", padding:0, letterSpacing:"0.05em" }}>got it</button>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingBottom:14, userSelect:"none" }}>
      <span style={{ ...M, fontSize:12, color:ARW, fontWeight:700 }}>{title}</span>
      {lines.map((l, i) => (
        <span key={i} style={{ ...M, fontSize:9, color:"#666", marginTop:i===0?4:2, textAlign:"center" }}>{l}</span>
      ))}
      <DownArrow />
      <button onClick={dismiss} style={{ ...M, marginTop:8, background:"none", border:"none", color:"#333", fontSize:10, cursor:"pointer", padding:0, letterSpacing:"0.05em" }}>got it</button>
    </div>
  );
}
