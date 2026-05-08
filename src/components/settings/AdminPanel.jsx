import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnA, btnG, btnD, sm, col } from '../../lib/styles';

const TIER_COLOR = { free: MUT, enthusiast: '#e8670a', team: '#0a8fe8', business: '#e8c20a' };
const ALL_TIERS  = ['free', 'enthusiast', 'team', 'business'];
const ADMIN_TABS = ['Overview', 'Users', 'Grants', 'Flags', 'Announcements', 'Audit'];

const lbl  = { fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 };
const card = { background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '12px 14px' };

function Msg({ m }) {
  if (!m) return null;
  return <div style={{ fontSize: 10, color: m.ok ? GRN : RED, marginBottom: 10 }}>{m.ok ? '✓ ' : '✗ '}{m.text}</div>;
}

function TierBadge({ tier }) {
  const t = tier || 'free';
  return (
    <span style={{ fontSize: 7, fontWeight: 700, color: TIER_COLOR[t], border: '1px solid ' + TIER_COLOR[t] + '55',
      padding: '1px 5px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t}</span>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('admin_get_stats').then(({ data }) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ fontSize: 10, color: MUT, padding: 32, textAlign: 'center' }}>Loading…</div>;
  if (!stats)  return null;

  const byTier = stats.by_tier || {};

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          ['Total Users',     stats.total_users,     null,  TXT],
          ['New This Week',   stats.new_this_week,   null,  GRN],
          ['New This Month',  stats.new_this_month,  null,  TXT],
          ['Total Machines',  stats.total_machines,  null,  ACC],
          ['Grants Pending',  stats.grants_pending,  null,  '#e8870a'],
          ['Grants Redeemed', stats.grants_redeemed, null,  GRN],
        ].map(([label, value, sub, color]) => (
          <div key={label} style={card}>
            <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{value ?? '—'}</div>
            {sub && <div style={{ fontSize: 8, color: MUT, marginTop: 4 }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
        Users by Tier
      </div>
      {ALL_TIERS.map(t => {
        const count = byTier[t] || 0;
        const pct   = stats.total_users > 0 ? count / stats.total_users : 0;
        return (
          <div key={t} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: TIER_COLOR[t], textTransform: 'capitalize', fontWeight: 700 }}>{t}</span>
              <span style={{ fontSize: 10, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>{count}</span>
            </div>
            <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
              <div style={{ height: '100%', background: TIER_COLOR[t], borderRadius: 2, width: (pct * 100) + '%', transition: 'width 0.4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Users ───────────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch]     = useState('');
  const [users,  setUsers]      = useState([]);
  const [loading, setLoading]   = useState(false);
  const [busy,   setBusy]       = useState(null);
  const [msg,    setMsg]        = useState(null);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    const { data } = await supabase.rpc('admin_list_users', { p_search: q, p_limit: 50, p_offset: 0 });
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setTier = async (email, tier) => {
    setBusy(email); setMsg(null);
    const { data, error } = await supabase.rpc('admin_set_tier', { p_email: email, p_tier: tier });
    setBusy(null);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `${email} set to ${tier}` });
    load(search);
  };

  const deactivate = async (email) => {
    if (!confirm(`Deactivate ${email}?\n\nThis resets them to free tier.`)) return;
    setBusy(email); setMsg(null);
    const { data, error } = await supabase.rpc('admin_deactivate_user', { p_email: email });
    setBusy(null);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `${email} deactivated` });
    load(search);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Search email or name…" value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)} style={{ ...btnG, ...sm }}>Search</button>
        <button onClick={() => { setSearch(''); load(''); }} style={{ ...btnG, ...sm }}>All</button>
      </div>
      <Msg m={msg} />
      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 20 }}>Loading…</div>}
      {users.map(u => (
        <div key={u.id} style={{ ...card, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: TXT, fontWeight: 700 }}>{u.display_name || u.username || '—'}</span>
                <TierBadge tier={u.tier} />
              </div>
              <div style={{ fontSize: 9, color: MUT, marginBottom: 3 }}>{u.email}</div>
              <div style={{ fontSize: 8, color: '#333' }}>
                Joined {new Date(u.created_at).toLocaleDateString()}
                {u.last_sign_in_at && <> · Last seen {new Date(u.last_sign_in_at).toLocaleDateString()}</>}
                {u.machine_count > 0 && <> · {u.machine_count} machine{u.machine_count !== 1 ? 's' : ''}</>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0, alignItems: 'flex-end' }}>
              <select
                style={{ ...inp, fontSize: 9, padding: '3px 6px', width: 'auto' }}
                value={u.tier || 'free'}
                onChange={e => setTier(u.email, e.target.value)}
                disabled={busy === u.email}
              >
                {ALL_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => deactivate(u.email)} disabled={busy === u.email}
                style={{ ...btnD, fontSize: 7, padding: '2px 7px', opacity: busy === u.email ? 0.5 : 1 }}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      ))}
      {!loading && users.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No users found.</div>
      )}
    </div>
  );
}

// ─── Grants ──────────────────────────────────────────────────────────────────

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
      color: c, border: '1px solid ' + c + '55', padding: '1px 5px', borderRadius: 2 }}>{s}</span>
  );
}

function GrantsTab() {
  const [email, setEmail]   = useState('');
  const [tier,  setTier]    = useState('business');
  const [busy,  setBusy]    = useState(false);
  const [msg,   setMsg]     = useState(null);
  const [grants, setGrants] = useState([]);
  const [revoking, setRevoking] = useState(null);

  const load = async () => {
    const { data } = await supabase.from('upgrade_grants').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setGrants(data);
  };

  useEffect(() => { load(); }, []);

  const grant = async () => {
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('grant_upgrade', { p_email: email.trim(), p_tier: tier });
    setBusy(false);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `Code ${data.code} issued to ${email.trim()}` });
    setEmail('');
    load();
  };

  const revoke = async (g) => {
    setRevoking(g.id);
    await supabase.rpc('revoke_upgrade', { p_email: g.email });
    setRevoking(null);
    load();
  };

  return (
    <div>
      <div style={{ background: '#08080f', border: '1px solid ' + ACC + '44', borderRadius: 2, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Issue Upgrade</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
          <div style={col}>
            <div style={lbl}>User Email</div>
            <input style={inp} type="email" placeholder="user@example.com" value={email}
              onChange={e => { setEmail(e.target.value); setMsg(null); }} onKeyDown={e => e.key === 'Enter' && grant()} />
          </div>
          <div style={col}>
            <div style={lbl}>Tier</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['enthusiast','team','business'].map(t => (
                <button key={t} onClick={() => setTier(t)} style={{ ...btnG, ...sm, textTransform: 'capitalize',
                  ...(tier === t ? { color: TIER_COLOR[t], border: '1px solid ' + TIER_COLOR[t] } : {}) }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <Msg m={msg} />
        <button onClick={grant} disabled={busy || !email.trim()} style={{ ...btnA, ...sm, opacity: busy || !email.trim() ? 0.5 : 1 }}>
          {busy ? 'Issuing…' : 'Issue Upgrade'}
        </button>
      </div>

      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Grants Log</div>
      {grants.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No grants yet.</div>}
      {grants.map(g => {
        const s = statusOf(g);
        return (
          <div key={g.id} style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>{g.code}</span>
                <StatusBadge g={g} />
              </div>
              <div style={{ fontSize: 9, color: MUT }}>
                {g.email}
                <span style={{ color: TIER_COLOR[g.tier] || ACC, marginLeft: 6, textTransform: 'capitalize' }}>{g.tier}</span>
                <span style={{ marginLeft: 8 }}>
                  {s === 'redeemed' ? `redeemed ${new Date(g.redeemed_at).toLocaleDateString()}`
                    : s === 'pending' ? `expires ${new Date(g.expires_at).toLocaleString()}`
                    : `expired ${new Date(g.expires_at).toLocaleDateString()}`}
                </span>
              </div>
            </div>
            {s === 'pending' && (
              <button onClick={() => revoke(g)} disabled={revoking === g.id}
                style={{ ...btnD, fontSize: 8, opacity: revoking === g.id ? 0.5 : 1 }}>Revoke</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Feature Flags ───────────────────────────────────────────────────────────

function FlagsTab() {
  const [flags,    setFlags]    = useState([]);
  const [adding,   setAdding]   = useState(false);
  const [newKey,   setNewKey]   = useState('');
  const [newLabel, setNewLabel] = useState('');

  const load = async () => {
    const { data } = await supabase.from('feature_flags').select('*').order('created_at');
    if (data) setFlags(data);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (f) => {
    await supabase.from('feature_flags').update({ enabled: !f.enabled }).eq('id', f.id);
    load();
  };

  const add = async () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    await supabase.from('feature_flags').insert({
      key:   newKey.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newLabel.trim(),
    });
    setNewKey(''); setNewLabel(''); setAdding(false);
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this flag?')) return;
    await supabase.from('feature_flags').delete().eq('id', id);
    load();
  };

  return (
    <div>
      {flags.length === 0 && !adding && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No flags yet.</div>
      )}
      {flags.map(f => (
        <div key={f.id} style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: TXT, fontWeight: 700 }}>{f.label}</div>
            <div style={{ fontSize: 8, color: MUT, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{f.key}</div>
          </div>
          <button onClick={() => toggle(f)} style={{ ...btnG, ...sm, fontSize: 9, minWidth: 36,
            color: f.enabled ? GRN : MUT, border: '1px solid ' + (f.enabled ? GRN : '#333') }}>
            {f.enabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => del(f.id)} style={{ ...btnD, fontSize: 8 }}>Del</button>
        </div>
      ))}
      {adding ? (
        <div style={{ ...card, marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div><div style={lbl}>Key (snake_case)</div><input style={inp} placeholder="my_feature" value={newKey} onChange={e => setNewKey(e.target.value)} autoFocus /></div>
            <div><div style={lbl}>Label</div><input style={inp} placeholder="My Feature" value={newLabel} onChange={e => setNewLabel(e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setAdding(false)} style={{ ...btnG, ...sm }}>Cancel</button>
            <button onClick={add} style={{ ...btnA, ...sm }}>Add Flag</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...btnG, ...sm, marginTop: 8 }}>+ New Flag</button>
      )}
    </div>
  );
}

// ─── Announcements ───────────────────────────────────────────────────────────

const EMPTY_ANN = { message: '', tier_filter: 'all', expires_at: '', link_url: '', link_label: '' };

function AnnouncementsTab() {
  const [list,   setList]   = useState([]);
  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState(EMPTY_ANN);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setList(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.message.trim()) return;
    await supabase.from('announcements').insert({
      message:     form.message.trim(),
      tier_filter: form.tier_filter,
      expires_at:  form.expires_at || null,
      link_url:    form.link_url || null,
      link_label:  form.link_label || null,
    });
    setForm(EMPTY_ANN); setAdding(false);
    load();
  };

  const toggle = async (a) => {
    await supabase.from('announcements').update({ active: !a.active }).eq('id', a.id);
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  };

  return (
    <div>
      {list.map(a => (
        <div key={a.id} style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: a.active ? TXT : MUT, lineHeight: 1.5, marginBottom: 4 }}>{a.message}</div>
            <div style={{ fontSize: 8, color: MUT }}>
              {a.tier_filter === 'all' ? 'All users' : a.tier_filter}
              {a.expires_at && <> · Expires {new Date(a.expires_at).toLocaleDateString()}</>}
              {a.link_url   && <> · <span style={{ color: ACC }}>{a.link_label || a.link_url}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => toggle(a)} style={{ ...btnG, ...sm, fontSize: 8,
              color: a.active ? GRN : MUT, border: '1px solid ' + (a.active ? GRN : '#333') }}>
              {a.active ? 'Live' : 'Off'}
            </button>
            <button onClick={() => del(a.id)} style={{ ...btnD, fontSize: 8 }}>Del</button>
          </div>
        </div>
      ))}
      {adding ? (
        <div style={{ ...card, marginTop: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={lbl}>Message</div>
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} value={form.message} onChange={set('message')} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <div style={lbl}>Show to</div>
              <select style={inp} value={form.tier_filter} onChange={set('tier_filter')}>
                <option value="all">All users</option>
                {ALL_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><div style={lbl}>Expires (optional)</div><input style={inp} type="datetime-local" value={form.expires_at} onChange={set('expires_at')} /></div>
            <div><div style={lbl}>Link URL (optional)</div><input style={inp} placeholder="https://…" value={form.link_url} onChange={set('link_url')} /></div>
            <div><div style={lbl}>Link Label</div><input style={inp} placeholder="Learn more" value={form.link_label} onChange={set('link_label')} /></div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setAdding(false); setForm(EMPTY_ANN); }} style={{ ...btnG, ...sm }}>Cancel</button>
            <button onClick={save} style={{ ...btnA, ...sm }}>Publish</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...btnG, ...sm, marginTop: 8 }}>+ New Announcement</button>
      )}
      {list.length === 0 && !adding && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No announcements yet.</div>
      )}
    </div>
  );
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

const ACTION_COLOR = { set_tier: ACC, grant: GRN, revoke: RED, deactivate: RED };

function AuditTab() {
  const [log,     setLog]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setLog(data || []); setLoading(false); });
  }, []);

  if (loading) return <div style={{ fontSize: 10, color: MUT, padding: 32, textAlign: 'center' }}>Loading…</div>;

  return (
    <div>
      {log.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No actions logged yet.</div>}
      {log.map(a => (
        <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + BRD, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: ACTION_COLOR[a.action] || MUT,
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.action}</span>
            {a.target_email && <span style={{ fontSize: 9, color: TXT, marginLeft: 8 }}>{a.target_email}</span>}
            {a.detail && <span style={{ fontSize: 9, color: MUT, marginLeft: 6 }}>→ {a.detail}</span>}
          </div>
          <div style={{ fontSize: 8, color: MUT, flexShrink: 0 }}>{new Date(a.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState('Overview');
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {ADMIN_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...btnG, ...sm, fontSize: 8,
            ...(tab === t ? { color: ACC, border: '1px solid ' + ACC } : {}) }}>{t}</button>
        ))}
      </div>
      {tab === 'Overview'      && <OverviewTab />}
      {tab === 'Users'         && <UsersTab />}
      {tab === 'Grants'        && <GrantsTab />}
      {tab === 'Flags'         && <FlagsTab />}
      {tab === 'Announcements' && <AnnouncementsTab />}
      {tab === 'Audit'         && <AuditTab />}
    </div>
  );
}
