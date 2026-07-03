// Lightweight DOM toast — framework-free so db helpers and event handlers can
// report success/failure without React context plumbing.
// Styled to match the backGuard exit toast.

let stack = [];

function render() {
  stack.forEach((el, i) => {
    el.style.bottom = `${32 + i * 48}px`;
  });
}

function show(message, { type = 'info', duration = 4000 } = {}) {
  const el = document.createElement('div');
  el.textContent = message;
  const colors = {
    info:    { bg: '#111111', fg: '#aaaaaa', border: '#333333' },
    success: { bg: '#0d1a0d', fg: '#7fc97f', border: '#2a4a2a' },
    error:   { bg: '#1a0d0d', fg: '#e08080', border: '#4a2a2a' },
  };
  const c = colors[type] || colors.info;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: c.bg,
    color: c.fg,
    fontSize: '12px',
    fontFamily: "'IBM Plex Mono', monospace",
    padding: '10px 18px',
    borderRadius: '4px',
    border: `1px solid ${c.border}`,
    zIndex: '99999',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    maxWidth: '90vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
  });
  document.body.appendChild(el);
  stack.push(el);
  render();
  setTimeout(() => {
    el.remove();
    stack = stack.filter(x => x !== el);
    render();
  }, duration);
}

export const toast        = (msg, opts)      => show(msg, opts);
export const toastError   = (msg, duration)  => show(msg, { type: 'error', duration: duration ?? 5000 });
export const toastSuccess = (msg, duration)  => show(msg, { type: 'success', duration });
