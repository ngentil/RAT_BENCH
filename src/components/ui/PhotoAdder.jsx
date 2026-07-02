import React, { useState } from 'react';
import { ACC, MUT, BRD, RED, btnG, col } from '../../lib/styles';
import { FL } from './shared';
import { uploadPhoto } from '../../lib/storage';

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
    // allSettled: one failed upload must not throw away the ones that succeeded
    const results = await Promise.allSettled(files.map(f => uploadPhoto(f)));
    const urls   = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected');
    if (urls.length) setPhotos(prev => [...prev, ...urls]);
    if (failed.length) {
      const msg = failed[0].reason?.message;
      setErr(`${failed.length} of ${files.length} failed — ${msg && msg !== 'canvas toBlob failed' ? msg : 'check connection'}`);
    }
    setBusy(false); e.target.value = '';
  };

  // Only remove from form state — the storage file is cleaned up when the
  // record itself is deleted. Deleting here would break the saved record if
  // the user cancels the form.
  const remove = (url, idx) => {
    setPhotos(ps => ps.filter((_, j) => j !== idx));
  };

  return (
    <div style={col}>
      <FL t={label} />
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 6 }}>
          {photos.map((p, i) => (
            <div key={p} style={{ position: 'relative' }}>
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
