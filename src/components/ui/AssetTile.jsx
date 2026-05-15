import React from 'react';
import { SURF, BRD, TXT, MUT } from '../../lib/styles';

export default function AssetTile({ photo, icon, accentColor, name, sub, badges, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: SURF, border: '1px solid ' + BRD,
      borderLeft: '3px solid ' + (accentColor || '#252525'),
      borderRadius: 2, cursor: 'pointer', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 80, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
        {photo
          ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 26, opacity: 0.4 }}>{icon}</span>}
      </div>
      <div style={{ padding: '7px 9px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TXT, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        {sub && <div style={{ fontSize: 8, color: MUT, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {(badges || []).map((b, i) => (
            <span key={i} style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '1px 5px', borderRadius: 2, background: b.c + '22', color: b.c, border: '1px solid ' + b.c + '55' }}>{b.l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
