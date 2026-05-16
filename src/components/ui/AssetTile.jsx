import React from 'react';
import { SURF, BRD, TXT, MUT } from '../../lib/styles';

export default function AssetTile({ photo, icon, accentColor, name, sub, badges = [], onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: SURF, border: '1px solid ' + BRD, borderTop: '2px solid ' + (accentColor || '#444'), borderRadius: 2, padding: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}
    >
      {photo
        ? <img src={photo} alt="" style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 2, border: '1px solid #252525' }} />
        : <div style={{ fontSize: 24, textAlign: 'center', lineHeight: '64px' }}>{icon}</div>
      }
      <div style={{ fontSize: 10, fontWeight: 700, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
      {sub && <div style={{ fontSize: 8, color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {badges.map((b, i) => (
            <span key={i} style={{ fontSize: 8, fontWeight: 700, color: b.c, background: b.c + '18', border: '1px solid ' + b.c + '44', padding: '1px 5px', borderRadius: 2, letterSpacing: '0.06em' }}>{b.l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
