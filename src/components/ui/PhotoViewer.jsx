import React, { useEffect, useRef } from 'react';
import { ACC } from '../../lib/styles';

export default function PhotoViewer({ src, onClose, isCover, onSetCover }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    history.pushState({ photoOpen: true }, '');
    // Android back button path — fires before component unmounts
    const onPop = () => onCloseRef.current();
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // X button / overlay / Escape: close immediately, then pop our history entry.
  // React unmounts this component (removing the popstate listener) before the
  // popstate macrotask fires, so history.back() here is just cleanup.
  const manualClose = () => {
    onCloseRef.current();
    history.back();
  };

  const onKey = e => { if (e.key === 'Escape') manualClose(); };

  return (
    <div onClick={manualClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.97)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* stopPropagation prevents the click bubbling to the overlay and calling manualClose twice */}
      <button onClick={e => { e.stopPropagation(); manualClose(); }} style={{
        position: 'absolute', top: 16, right: 16,
        width: 52, height: 52,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        border: '2px solid rgba(255,255,255,0.5)',
        color: '#fff',
        fontSize: 24,
        fontFamily: 'sans-serif',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
        WebkitTapHighlightColor: 'transparent',
      }}>✕</button>
      <img src={src} alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 2, userSelect: 'none' }}
      />
      {onSetCover && (
        <button
          onClick={e => { e.stopPropagation(); if (!isCover) onSetCover(); }}
          style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: isCover ? ACC : 'rgba(255,255,255,0.15)',
            border: '2px solid ' + (isCover ? ACC : 'rgba(255,255,255,0.5)'),
            color: isCover ? '#000' : '#fff',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            borderRadius: 999, padding: '10px 20px',
            cursor: isCover ? 'default' : 'pointer',
            fontFamily: "'IBM Plex Mono',monospace",
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isCover ? '★ Cover Photo' : '☆ Set as Cover'}
        </button>
      )}
    </div>
  );
}
