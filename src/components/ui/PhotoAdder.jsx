import React from 'react';
import { ACC, MUT, BRD, TXT, btnG, col } from '../../lib/styles';
import { FL } from './shared';
function PhotoAdder({photos,setPhotos,label="Photos"}){
  const [busy,setBusy]=useState(false);
  const camRef=React.useRef();
  const galRef=React.useRef();
  const handle=async e=>{
    const files=Array.from(e.target.files);if(!files.length)return;
    setBusy(true);
    const processed=await Promise.all(files.map(async f=>resizeImg(await toB64(f))));
    setPhotos(prev=>[...prev,...processed]);setBusy(false);e.target.value="";
  };
  return (
    <div style={col}>
      <FL t={label} />
      {photos.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:6}}>
          {photos.map((p,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={p} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:2,border:"1px solid "+BRD,display:"block"}} />
              <button onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.8)",border:"none",color:"#ccc",width:16,height:16,borderRadius:"50%",cursor:"pointer",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          ))}
        </div>
      )}
      {busy?<div style={{fontSize:9,color:MUT,textAlign:"center",padding:"9px 0",letterSpacing:"0.1em",textTransform:"uppercase"}}>Processing...</div>:
      <div style={{display:"flex",gap:6}} onClick={ev=>ev.stopPropagation()}>
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handle} style={{display:"none"}} />
        <input ref={galRef} type="file" accept="image/*" multiple onChange={handle} style={{display:"none"}} />
        <button onClick={()=>camRef.current.click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>📷 Camera</button>
        <button onClick={()=>galRef.current.click()} style={{...btnG,flex:1,fontSize:9,padding:"8px 0"}}>🖼 Gallery</button>
      </div>}
    </div>
  );
}
export default PhotoAdder;