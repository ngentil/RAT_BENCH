import React, { useState } from 'react';
import { ACC, MUT, BRD, RED, btnG, col } from '../../lib/styles';
import { FL } from './shared';
import { uploadPhoto, deletePhoto } from '../../lib/storage';

function PhotoAdder({ photos, setPhotos, label = "Photos" }) {
  const [busy, setBusy]   = useState(false);
  const [err,  setErr]    = useState(null);
  const camRef = React.useRef();
  const galRef = React.useRef();

  const handle = async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const oversized = files.find(f => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setErr(`File too large (${(oversized.size / 1024 / 1024).toFixed(0)}MB). Max 50MB.`);
      e.target.value = ''; return;
    }
    setBusy(true); setErr(null);
    try {
      const urls = await Promise.all(files.map(f => uploadPhoto(f)));
      setPhotos(prev => [...prev, ...urls]);
    } catch (ex) {
      setErr('Upload failed — check connection');
    }
    setBusy(false); e.target.value = '';
  };

  const remove = (url, idx) => {
    deletePhoto(url);
    setPhotos(ps => ps.filter((_, j) => j !== idx));
  };

  return (
    <div style={col}>
      <FL t={label} />
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 6 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={p} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 2, border: '1px solid ' + BRD, display: 'block' }} />
              <button onClick={() => remove(p, i)}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.8)', border: 'none', color: '#ccc', width: 16, height: 16, borderRadius: '50%', cursor: 'pointer', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {err && <div style={{ fontSize: 9, color: RED, marginBottom: 6 }}>{err}</div>}
      {busy
        ? <div style={{ fontSize: 9, color: MUT, textAlign: 'center', padding: '9px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Uploading...</div>
        : <div style={{ display: 'flex', gap: 6 }} onClick={ev => ev.stopPropagation()}>
            <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handle} style={{ display: 'none' }} />
            <input ref={galRef} type="file" accept="image/*" multiple onChange={handle} style={{ display: 'none' }} />
            <button onClick={() => camRef.current.click()} style={{ ...btnG, flex: 1, fontSize: 9, padding: '8px 0' }}>📷 Camera</button>
            <button onClick={() => galRef.current.click()} style={{ ...btnG, flex: 1, fontSize: 9, padding: '8px 0' }}>🖼 Gallery</button>
          </div>
      }
    </div>
  );
}

export default PhotoAdder;
