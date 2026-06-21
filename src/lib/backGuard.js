// Back-button exit guard for Android PWA / browser.
// Intercepts the first back press when the user is at the app's "home" state
// and shows a "Press back again to exit" toast before allowing navigation away.
//
// States we push/recognise:
//   { appSentinel: true } — guard marker pushed at app start
//   { photoOpen: true }   — PhotoViewer
//   { cardOpen: <id> }    — MachineCard (and other expandable cards)
//
// Call installBackGuard() once, before ReactDOM.render.

const KNOWN = ['photoOpen', 'cardOpen', 'appSentinel'];
const isKnown = s => s != null && KNOWN.some(k => k in s);

let warned = false;
let timer = null;
let toastEl = null;

function showToast() {
  if (toastEl) return;
  toastEl = document.createElement('div');
  toastEl.textContent = 'Press back again to exit';
  Object.assign(toastEl.style, {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111111',
    color: '#aaaaaa',
    fontSize: '12px',
    fontFamily: "'IBM Plex Mono', monospace",
    padding: '10px 18px',
    borderRadius: '4px',
    border: '1px solid #333333',
    zIndex: '99999',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
  });
  document.body.appendChild(toastEl);
}

function hideToast() {
  if (toastEl) { toastEl.remove(); toastEl = null; }
}

export function installBackGuard() {
  // Push sentinel so the first back press is catchable rather than closing the app.
  history.pushState({ appSentinel: true }, '');

  window.addEventListener('popstate', e => {
    // PhotoViewer / card handlers manage their own states — ignore those.
    if (isKnown(e.state)) return;

    if (warned) {
      // Second back press within 2 s — let the browser navigate away / close app.
      warned = false;
      clearTimeout(timer);
      hideToast();
      return;
    }

    // First back press at the bottom of our history stack.
    warned = true;
    showToast();
    // Re-push sentinel so the second press is also catchable.
    history.pushState({ appSentinel: true }, '');

    timer = setTimeout(() => {
      warned = false;
      hideToast();
      // Sentinel is already in place for the next attempt.
    }, 2000);
  });
}
