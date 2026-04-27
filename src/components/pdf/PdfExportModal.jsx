import React, { useState } from 'react';
import { ACC, MUT, BRD, SURF, TXT, btnA, btnG, dvdr, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { PDF_SCHEMA, exportMachinePDF } from '../../lib/pdfExport';
function PdfExportModal({m,svcs,onClose}){
  const available=React.useMemo(()=>PDF_SCHEMA.map(sec=>{
    if(sec.svc) return svcs.length>0?sec:null;
    if(sec.array) return m.fasteners?.length>0?sec:null;
    const fields=sec.fields.filter(f=>m[f.k]!=null&&m[f.k]!=="");
    return fields.length>0?{...sec,fields}:null;
  }).filter(Boolean),[]);

  const [opts,setOpts]=React.useState(()=>{
    const o={};
    available.forEach(sec=>{
      if(sec.svc||sec.array){o[sec.k]=true;}
      else{o[sec.k]={};sec.fields.filter(f=>m[f.k]!=null&&m[f.k]!=="").forEach(f=>{o[sec.k][f.k]=true;});}
    });
    return o;
  });
  const [openSecs,setOpenSecs]=React.useState(()=>new Set());

  const toggleSec=k=>{
    const sec=available.find(s=>s.k===k);
    if(!sec)return;
    if(sec.svc||sec.array){setOpts(o=>({...o,[k]:!o[k]}));return;}
    const allOn=sec.fields.every(f=>opts[k]?.[f.k]);
    const fields={};sec.fields.forEach(f=>{fields[f.k]=!allOn;});
    setOpts(o=>({...o,[k]:fields}));
  };
  const toggleField=(sk,fk)=>setOpts(o=>({...o,[sk]:{...o[sk],[fk]:!o[sk]?.[fk]}}));
  const toggleOpen=k=>setOpenSecs(s=>{const n=new Set(s);n.has(k)?n.delete(k):n.add(k);return n;});

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURF,border:"1px solid "+BRD,borderRadius:"4px 4px 0 0",width:"100%",maxWidth:520,maxHeight:"82vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid "+BRD,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:700,color:TXT,letterSpacing:"0.08em",textTransform:"uppercase"}}>PDF Export Options</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {available.map(sec=>{
            const isOpen=openSecs.has(sec.k);
            const allOn=sec.svc||sec.array?!!opts[sec.k]:sec.fields.every(f=>opts[sec.k]?.[f.k]);
            const someOn=sec.svc||sec.array?allOn:sec.fields.some(f=>opts[sec.k]?.[f.k]);
            return(
              <div key={sec.k} style={{borderBottom:"1px solid "+BRD+"33"}}>
                <div style={{display:"flex",alignItems:"center",padding:"9px 16px",gap:10}}>
                  <input type="checkbox" checked={allOn} onChange={()=>toggleSec(sec.k)}
                    ref={el=>{if(el)el.indeterminate=!allOn&&someOn;}}
                    onClick={e=>e.stopPropagation()} style={{cursor:"pointer",flexShrink:0}}/>
                  <span onClick={()=>toggleOpen(sec.k)} style={{flex:1,fontSize:10,fontWeight:700,color:someOn?TXT:MUT,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>{sec.l}</span>
                  {!sec.svc&&!sec.array&&<span onClick={()=>toggleOpen(sec.k)} style={{fontSize:9,color:MUT,cursor:"pointer"}}>{isOpen?"▲":"▼"}</span>}
                </div>
                {isOpen&&!sec.svc&&!sec.array&&(
                  <div style={{paddingLeft:42,paddingBottom:8,display:"flex",flexWrap:"wrap",gap:"2px 16px"}}>
                    {sec.fields.map(f=>(
                      <label key={f.k} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer",minWidth:120}}>
                        <input type="checkbox" checked={!!opts[sec.k]?.[f.k]} onChange={()=>toggleField(sec.k,f.k)} style={{cursor:"pointer"}}/>
                        <span style={{fontSize:10,color:opts[sec.k]?.[f.k]?TXT:MUT}}>{f.l}</span>
                      </label>
                    ))}
                  </div>
                )}
                {isOpen&&(sec.svc||sec.array)&&(
                  <div style={{paddingLeft:42,paddingBottom:8}}>
                    <span style={{fontSize:9,color:MUT}}>{sec.svc?`${svcs.length} entr${svcs.length===1?"y":"ies"}`:"All fasteners included as block"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid "+BRD,display:"flex",gap:8,flexShrink:0}}>
          <button onClick={onClose} style={{...btnG,flex:1,fontSize:10}}>Cancel</button>
          <button onClick={()=>{exportMachinePDF(m,svcs,opts);onClose();}} style={{...btnA,flex:2,fontSize:10}}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}
export default PdfExportModal;