import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, inp } from '../../lib/styles';
function WikiHomePage(){
  const [query,setQuery]=React.useState("");
  const [results,setResults]=React.useState([]);
  const [recent,setRecent]=React.useState([]);
  const [searching,setSearching]=React.useState(false);

  React.useEffect(()=>{
    searchWiki("").then(r=>setRecent(r||[]));
  },[]);

  React.useEffect(()=>{
    if(!query.trim()){setResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      const r=await searchWiki(query);
      setResults(r||[]);
      setSearching(false);
    },300);
    return()=>clearTimeout(t);
  },[query]);

  const list=query.trim()?results:recent;

  return(
    <div style={{minHeight:"100vh",background:BG,color:TXT,fontFamily:"'IBM Plex Mono',monospace"}}>
      <div style={{background:SURF,borderBottom:"2px solid "+ACC,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🐀</span>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:ACC,letterSpacing:"0.04em",textTransform:"uppercase"}}>Rat Bench Wiki</div>
          <div style={{fontSize:9,color:MUT,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}}>community machine specs</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          <a href="https://ratbench.net" style={{fontSize:9,color:MUT,textDecoration:"none",letterSpacing:"0.06em"}}>← App</a>
        </div>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 16px"}}>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search machines..."
          style={{width:"100%",boxSizing:"border-box",background:SURF,border:"1px solid "+BRD,color:TXT,fontFamily:"'IBM Plex Mono',monospace",fontSize:13,padding:"10px 14px",borderRadius:2,outline:"none",marginBottom:20}}
        />
        {searching&&<div style={{fontSize:10,color:MUT,marginBottom:12}}>Searching…</div>}
        {list.length===0&&!searching&&(
          <div style={{fontSize:10,color:MUT,textAlign:"center",marginTop:40}}>
            {query.trim()?"No results.":"No wiki entries yet."}
          </div>
        )}
        {list.map(e=>(
          <a key={e.id} href={"/"+e.slug} style={{display:"block",textDecoration:"none",marginBottom:10}}>
            <div style={{background:SURF,border:"1px solid "+BRD,padding:"12px 16px",borderRadius:2,cursor:"pointer"}}>
              <div style={{fontSize:13,fontWeight:700,color:ACC,marginBottom:4}}>{e.make} {e.model}</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {(e.type||e.category)&&<span style={{fontSize:10,color:MUT}}>{e.type||e.category}</span>}
                {e.year&&<span style={{fontSize:10,color:MUT}}>{e.year}</span>}
                {e.engine_make&&<span style={{fontSize:10,color:MUT}}>Engine: {e.engine_make}{e.engine_model?" "+e.engine_model:""}</span>}
                <span style={{fontSize:10,color:MUT,marginLeft:"auto"}}>{e.view_count||0} views</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const WIKI_FIELD_LABELS={
  make:"Make",model:"Model",category:"Category",year:"Year",serial_number:"Serial No.",
  engine_make:"Engine Make",engine_model:"Engine Model",engine_type:"Engine Type",
  engine_cc:"Engine cc",engine_hp:"Engine HP",engine_kw:"Engine kW",
  engine_serial:"Engine Serial",engine_notes:"Engine Notes",
  blade_size:"Blade Size",blade_count:"Blade Count",
  deck_size:"Deck Size (in)",deck_material:"Deck Material",
  drive_type:"Drive Type",drive_speeds:"Drive Speeds",
  fuel_type:"Fuel Type",fuel_mix:"Fuel Mix",fuel_tank_l:"Fuel Tank (L)",
  oil_type:"Oil Type",oil_capacity_l:"Oil Capacity (L)",
  spark_plug:"Spark Plug",plug_gap_mm:"Plug Gap (mm)",
  air_filter:"Air Filter",oil_filter:"Oil Filter",
  blade_bolt_nm:"Blade Bolt (Nm)",wheel_nut_nm:"Wheel Nut (Nm)",
  tyre_size_front:"Tyre Front",tyre_size_rear:"Tyre Rear",tyre_pressure_front:"Tyre Psi Front",tyre_pressure_rear:"Tyre Psi Rear",
  belt_drive:"Drive Belt",belt_blade:"Blade Belt",belt_alt:"Alt Belt",
  battery_cca:"Battery CCA",battery_ah:"Battery Ah",
  weight_kg:"Weight (kg)",length_mm:"Length (mm)",width_mm:"Width (mm)",height_mm:"Height (mm)",
  notes:"Notes",
};
export default WikiHomePage;
