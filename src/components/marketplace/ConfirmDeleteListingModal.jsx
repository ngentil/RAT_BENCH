import React, { useState, useEffect } from 'react';
import { MUT, RED, TXT, btnG, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { getListingThreadCount, deleteListingPermanently } from '../../lib/marketplace';

function ConfirmDeleteListingModal({ listing, onClose, onDeleted }) {
  const [threadCount, setThreadCount] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getListingThreadCount(listing.id).then(n => { if (!cancelled) setThreadCount(n); });
    return () => { cancelled = true; };
  }, [listing.id]);

  const confirmDelete = async () => {
    setDeleting(true); setError(null);
    try {
      await deleteListingPermanently(listing.id);
      onDeleted();
    } catch (e) {
      setError(e.message || "Couldn't delete this listing.");
      setDeleting(false);
    }
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && !deleting && onClose()}>
      <div style={{ ...mdl, maxWidth: 380 }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: RED }}>Delete Permanently</b>
        </div>
        <div style={{ ...mdlB, fontSize: 11, color: TXT, lineHeight: 1.6 }}>
          Permanently delete <b>{listing.title}</b>? This can't be undone.
          {threadCount === null ? (
            <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>Checking for conversations…</div>
          ) : threadCount > 0 ? (
            <div style={{ fontSize: 10, color: RED, marginTop: 8 }}>
              This will also permanently delete {threadCount} conversation{threadCount !== 1 ? 's' : ''} with {threadCount !== 1 ? 'buyers' : 'a buyer'} and all their messages.
            </div>
          ) : (
            <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>No conversations are tied to this listing.</div>
          )}
          {error && <div style={{ fontSize: 10, color: RED, marginTop: 8 }}>{error}</div>}
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onClose} disabled={deleting}>Cancel</button>
          <button
            style={{ ...btnG, color: RED, borderColor: "#3a1a1a", opacity: threadCount === null || deleting ? 0.5 : 1 }}
            disabled={threadCount === null || deleting}
            onClick={confirmDelete}
          >
            {deleting ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteListingModal;
