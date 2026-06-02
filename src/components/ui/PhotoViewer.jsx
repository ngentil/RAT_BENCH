import React, { useEffect, useRef } from 'react';

export default function PhotoViewer({ src, onClose }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    // Push a history entry so the Android back button closes the viewer
    history.pushState({ photoOpen: true }, '');
    const onPop = () => onCloseRef.current();
    const onKey = e => { if (e.key === 'Escape') history.back(); };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const close = () => history.back();

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.97)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Large X — easy to tap on mobile */}
      <button onClick={close} style={{
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
    </div>
  );
}
