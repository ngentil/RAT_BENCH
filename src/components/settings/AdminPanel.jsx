import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnA, btnG, btnD, sm, col } from '../../lib/styles';

const TIERS = ['enthusiast', 'team', 'business'];
const TIER_COLOR = { enthusiast: '#e8670a', team: '#0a8fe8', business: '#e8c20a' };

function statusOf(g) {
  if (g.redeemed_at) return 'redeemed';
  if (new Date(g.expires_at) < new Date()) return 'expired';
  return 'pending';
}

function StatusBadge({ g }) {
  const s = statusOf(g);
  const c = s === 'redeemed' ? GRN : s === 'pending' ? ACC : MUT;
  return (
    <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: c, border: '1px solid ' + c + '55', padding: '1px 5px', borderRadius: 2 }}>
      {s}
    </span>
  );
}

export default function AdminPanel() {
  const [email, setEmail]   = useState('');
  const [tier, setTier]     = useState('business');
  const [busy, setBusy]     = useState(false);
  const [msg, setMsg]       = useState(null);
  const [grants, setGrants] = useState([]);
  const [revoking, setRevoking] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from('upgrade_grants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setGrants(data);
  };

  useEffect(() => { load(); }, []);

  const grant = async () => {
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('grant_upgrade', { p_email: email.trim(), p_tier: tier });
    setBusy(false);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `✓ Code ${data.code} issued to ${email.trim()}` });
    setEmail('');
    load();
  };

  const revoke = async (g) => {
    setRevoking(g.id);
    await supabase.rpc('revoke_upgrade', { p_email: g.email });
    setRevoking(null);
    load();
  };

  const lbl = { fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 };

  return (
    <div>
      {/* Grant form */}
      <div style={{ background: '#08080f', border: '1px solid ' + ACC + '44', borderRadius: 2, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
          Issue Upgrade
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 10 }}>
          <div style={col}>
            <div style={lbl}>User Email</div>
            <input
              style={inp}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setMsg(null); }}
              onKeyDown={e => e.key === 'Enter' && grant()}
            />
          </div>
          <div style={col}>
            <div style={lbl}>Tier</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {TIERS.map(t => (
                <button key={t} onClick={() => setTier(t)} style={{
                  ...btnG, ...sm, textTransform: 'capitalize',
                  ...(tier === t ? { color: TIER_COLOR[t], border: '1px solid ' + TIER_COLOR[t] } : {})
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        {msg && (
          <div style={{ fontSize: 10, color: msg.ok ? GRN : RED, marginBottom: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
            {msg.text}
          </div>
        )}
        <button onClick={grant} disabled={busy || !email.trim()} style={{ ...btnA, ...sm, opacity: busy || !email.trim() ? 0.5 : 1 }}>
          {busy ? 'Issuing…' : 'Issue Upgrade'}
        </button>
      </div>

      {/* Grants log */}
      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
        Grants Log
      </div>
      {grants.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, padding: '24px 0', textAlign: 'center' }}>No grants yet.</div>
      )}
      {grants.map(g => {
        const s = statusOf(g);
        return (
          <div key={g.id} style={{ background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>{g.code}</span>
                <StatusBadge g={g} />
              </div>
              <div style={{ fontSize: 9, color: MUT }}>
                {g.email}
                <span style={{ color: TIER_COLOR[g.tier] || ACC, marginLeft: 6, textTransform: 'capitalize' }}>{g.tier}</span>
                <span style={{ marginLeft: 8 }}>
                  {s === 'redeemed'
                    ? `redeemed ${new Date(g.redeemed_at).toLocaleDateString()}`
                    : s === 'pending'
                    ? `expires ${new Date(g.expires_at).toLocaleString()}`
                    : `expired ${new Date(g.expires_at).toLocaleDateString()}`}
                </span>
              </div>
            </div>
            {s === 'pending' && (
              <button
                onClick={() => revoke(g)}
                disabled={revoking === g.id}
                style={{ ...btnD, fontSize: 8, opacity: revoking === g.id ? 0.5 : 1 }}
              >
                Revoke
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
