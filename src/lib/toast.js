// Lightweight DOM toast — framework-free so db helpers and event handlers can
// report success/failure without React context plumbing.
// Styled to match the backGuard exit toast.
import { ACC } from './styles';

let stack = [];

function render() {
  stack.forEach((el, i) => {
    el.style.bottom = `${32 + i * 48}px`;
  });
}

function remove(el) {
  el.remove();
  stack = stack.filter(x => x !== el);
  render();
}

function baseStyle(el, type) {
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
    whiteSpace: 'nowrap',
    maxWidth: '90vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
  });
  return c;
}

function show(message, { type = 'info', duration = 4000 } = {}) {
  const el = document.createElement('div');
  el.textContent = message;
  baseStyle(el, type);
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  stack.push(el);
  render();
  setTimeout(() => remove(el), duration);
}

// A toast with an inline "UNDO" action, for a just-deleted item — replaces
// an "are you sure?" confirm() popup with "just do it, here's a few seconds
// to change your mind" instead. Clicking UNDO calls onUndo() and dismisses
// immediately; otherwise it auto-dismisses like any other toast after
// `duration` (default a bit longer than a plain toast, since there's an
// actual decision to read and make, not just a status to notice).
function showUndo(message, onUndo, { duration = 6000 } = {}) {
  const el = document.createElement('div');
  baseStyle(el, 'info');
  el.style.pointerEvents = 'auto'; // only this small pill — nothing else on the page is affected

  el.appendChild(document.createTextNode(message + '  '));

  const btn = document.createElement('button');
  btn.textContent = 'UNDO';
  Object.assign(btn.style, {
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: '4px',
    color: ACC,
    fontWeight: '700',
    letterSpacing: '0.06em',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'underline',
  });
  let timer;
  btn.onclick = () => {
    clearTimeout(timer);
    remove(el);
    onUndo();
  };
  el.appendChild(btn);

  document.body.appendChild(el);
  stack.push(el);
  render();
  timer = setTimeout(() => remove(el), duration);
}

export const toast        = (msg, opts)      => show(msg, opts);
export const toastError   = (msg, duration)  => show(msg, { type: 'error', duration: duration ?? 5000 });
export const toastSuccess = (msg, duration)  => show(msg, { type: 'success', duration });
export const toastUndo    = (msg, onUndo, duration) => showUndo(msg, onUndo, { duration });
