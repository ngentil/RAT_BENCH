import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { deleteUserPhotos } from '../../lib/storage';
import { listActivity, subscribeToActivity } from '../../lib/activityLog';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, btnA, btnG, btnD, sm, col } from '../../lib/styles';

const ADMIN_TABS  = ['Overview', 'Users', 'Flags', 'Wiki Reports', 'Announcements', 'Audit', 'Live Log'];
const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL, 'nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'].filter(Boolean);

const lbl  = { fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 };
const card = { background: SURF, border: '1px solid ' + BRD, borderRadius: 2, padding: '12px 14px' };

function Msg({ m }) {
  if (!m) return null;
  return <div style={{ fontSize: 10, color: m.ok ? GRN : RED, marginBottom: 10 }}>{m.ok ? '✓ ' : '✗ '}{m.text}</div>;
}

// ─── Overview ────────────────────────────────────────────────────────────────

function Sparkline({ days }) {
  if (!days?.length) return null;
  const max = Math.max(...days.map(d => d.count), 1);
  const W = 120, H = 28, pad = 2;
  const pts = days.map((d, i) => {
    const x = pad + (i / Math.max(days.length - 1, 1)) * (W - pad * 2);
    const y = pad + (1 - d.count / max) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={GRN} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      {days.map((d, i) => {
        const x = pad + (i / Math.max(days.length - 1, 1)) * (W - pad * 2);
        const y = pad + (1 - d.count / max) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2" fill={GRN} opacity="0.9" />;
      })}
    </svg>
  );
}

function OverviewTab() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('admin_get_stats').then(({ data }) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ fontSize: 10, color: MUT, padding: 32, textAlign: 'center' }}>Loading…</div>;
  if (!stats)  return null;

  const byType        = stats.machines_by_type || {};
  const signupsByDay  = stats.signups_by_day   || [];
  const typeKeys      = Object.keys(byType).sort((a, b) => byType[b] - byType[a]);

  return (
    <div>
      {/* ── Users ── */}
      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Users</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          ['Total',          stats.total_users,    TXT],
          ['New (7 days)',   stats.new_this_week,  GRN],
          ['New (30 days)',  stats.new_this_month, TXT],
          ['Active (7 days)',  stats.active_last_7d,  GRN],
          ['Active (30 days)', stats.active_last_30d, TXT],
        ].map(([label, value, color]) => (
          <div key={label} style={{ ...card, borderTop: '2px solid ' + color, boxShadow: '0 0 10px ' + color + '14' }}>
            <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: '-0.02em' }}>{value ?? '—'}</div>
          </div>
        ))}
        {/* Signup trend sparkline */}
        <div style={{ ...card, borderTop: '2px solid ' + GRN + '55', gridColumn: signupsByDay.length ? 'auto' : undefined }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Signups 14d</div>
          <Sparkline days={signupsByDay} />
        </div>
      </div>

      {/* ── Machines ── */}
      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Machines</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div style={{ ...card, borderTop: '2px solid ' + ACC, boxShadow: '0 0 10px ' + ACC + '14' }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: ACC, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: '-0.02em' }}>{stats.total_machines ?? '—'}</div>
        </div>
        <div style={{ ...card, borderTop: '2px solid ' + MUT }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Avg / User</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TXT, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1, letterSpacing: '-0.02em' }}>
            {stats.total_users > 0 ? (stats.total_machines / stats.total_users).toFixed(1) : '—'}
          </div>
        </div>
      </div>

      {typeKeys.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>By Machine Type</div>
          {typeKeys.map(t => {
            const count = byType[t] || 0;
            const pct   = stats.total_machines > 0 ? count / stats.total_machines : 0;
            return (
              <div key={t} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: TXT, textTransform: 'capitalize' }}>{t}</span>
                  <span style={{ fontSize: 10, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{count}</span>
                </div>
                <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
                  <div style={{ height: '100%', background: ACC, borderRadius: 2, width: (pct * 100) + '%', transition: 'width 0.4s', opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginBottom: 20 }} />
        </>
      )}

    </div>
  );
}

// ─── Users ───────────────────────────────────────────────────────────────────

// Bigger, well-separated action buttons + bulk selection — the original
// tiny (fontSize 7, padding "2px 7px") stacked buttons were easy to mis-tap
// on a phone, especially Del Wiki vs the adjacent Delete. Deactivate/Del Wiki
// now sit in a 2-column row at a real tap-target size; Delete gets its own
// full-width row below a divider so the most destructive action is spatially
// isolated from the other two, mirroring the pattern already used for the
// full-width Delete button on machine cards (MachineCard.jsx).
const rowBtn  = { fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '10px 8px', borderRadius: 3, cursor: 'pointer', minHeight: 40, border: '1px solid #3a1a1a', background: 'none', color: '#884040' };
const delBtn  = { ...rowBtn, minHeight: 44, background: '#2a0a0a', borderColor: RED, color: RED, fontSize: 11 };

// Per-user override dropdowns are driven live off whatever rows exist in
// feature_flags (see loadFlagOptions below) rather than a hardcoded list —
// any flag added in the Flags tab (built-in or via "+ New Flag") shows up
// here automatically, no code change needed. member_cap is the one
// exclusion: it holds a number, not an on/off switch, so a per-user
// override wouldn't mean anything for it.
const NON_OVERRIDABLE_FLAG_KEYS = ['member_cap'];

function UsersTab() {
  const [search, setSearch]     = useState('');
  const [users,  setUsers]      = useState([]);
  const [loading, setLoading]   = useState(false);
  const [busy,   setBusy]       = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [msg,    setMsg]        = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  // { [user_id]: { wiki: true|false|undefined, marketplace: ... } } —
  // undefined means "no override row", i.e. inherit the global flag.
  const [overrides, setOverrides] = useState({});
  // [{key,label}] — every overridable row currently in feature_flags.
  const [flagOptions, setFlagOptions] = useState([]);

  const loadOverrides = useCallback(async () => {
    const { data } = await supabase.from('user_feature_flags').select('user_id,flag_key,enabled');
    const byUser = {};
    for (const r of data || []) { (byUser[r.user_id] ??= {})[r.flag_key] = r.enabled; }
    setOverrides(byUser);
  }, []);

  const loadFlagOptions = useCallback(async () => {
    const { data } = await supabase.from('feature_flags').select('key,label').order('created_at');
    setFlagOptions((data || []).filter(f => !NON_OVERRIDABLE_FLAG_KEYS.includes(f.key)));
  }, []);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_users', { p_search: q, p_limit: 50, p_offset: 0 });
    setUsers(data || []);
    setLoadError(error ? error.message : null);
    setLoading(false);
    loadOverrides();
    loadFlagOptions();
  }, [loadOverrides, loadFlagOptions]);

  useEffect(() => { load(); }, [load]);

  // value is 'default' (remove any override — inherit the global flag),
  // 'on', or 'off'. Optimistic local update so the dropdown doesn't flicker
  // back to its old value while the write is in flight.
  const setOverride = async (userId, flagKey, value) => {
    setMsg(null);
    setOverrides(prev => ({ ...prev, [userId]: { ...prev[userId], [flagKey]: value === 'default' ? undefined : value === 'on' } }));
    const result = value === 'default'
      ? await supabase.from('user_feature_flags').delete().eq('user_id', userId).eq('flag_key', flagKey)
      : await supabase.from('user_feature_flags').upsert({ user_id: userId, flag_key: flagKey, enabled: value === 'on' }, { onConflict: 'user_id,flag_key' });
    if (result.error) { setMsg({ ok: false, text: `Couldn't update ${flagKey} override: ${result.error.message}` }); loadOverrides(); }
  };

  const deactivate = async (email) => {
    if (!confirm(`Deactivate ${email}?`)) return;
    setBusy(email); setMsg(null);
    const { data, error } = await supabase.rpc('admin_deactivate_user', { p_email: email });
    setBusy(null);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `${email} deactivated` });
    load(search);
  };

  const deleteWiki = async (u) => {
    const label = u.email || u.username || u.id;
    if (!confirm(`Delete all wiki entries by ${label}?\n\nThis permanently removes all wiki content they authored.\n\nThis CANNOT be undone.`)) return;
    setBusy(u.id + '_wiki'); setMsg(null);
    const { data, error } = await supabase.rpc('admin_delete_user_wiki', { p_user_id: u.id });
    setBusy(null);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    setMsg({ ok: true, text: `${data.deleted} wiki ${data.deleted === 1 ? 'entry' : 'entries'} deleted for ${label}` });
  };

  const deleteUser = async (u) => {
    const label = u.email || u.username || u.id;
    if (ADMIN_EMAILS.includes(u.email)) { setMsg({ ok: false, text: 'Cannot delete the admin account.' }); return; }
    if (!confirm(`PERMANENTLY DELETE ${label}?\n\nThis deletes their Supabase account and ALL their workshop data — machines, clients, parts, vehicles, tools, everything.\n\nThis CANNOT be undone.`)) return;
    if (!confirm(`Second confirmation: delete ${label} forever?`)) return;
    setBusy(u.id); setMsg(null);
    const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: u.id });
    setBusy(null);
    if (error || data?.error) { setMsg({ ok: false, text: error?.message || data?.error }); return; }
    await deleteUserPhotos(u.id);
    setMsg({ ok: true, text: `${label} permanently deleted` });
    load(search);
  };

  // Admin accounts are never selectable for bulk actions — deleteUser()
  // already refuses to delete them one at a time; excluding them from
  // selection entirely means a "Select all" can never sweep one in.
  const selectableUsers = users.filter(u => !ADMIN_EMAILS.includes(u.email));
  const allSelected = selectableUsers.length > 0 && selectableUsers.every(u => selected.has(u.id));
  const toggleSelect = id => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleSelectAll = () => setSelected(allSelected ? new Set() : new Set(selectableUsers.map(u => u.id)));
  const selectedUsers = users.filter(u => selected.has(u.id));

  const runBulk = async (targets, fn) => {
    const results = [];
    for (const u of targets) {
      try { results.push({ u, ...(await fn(u)) }); }
      catch (e) { results.push({ u, ok: false, err: e.message }); }
    }
    return results;
  };

  const bulkDeactivate = async () => {
    const targets = selectedUsers;
    if (!targets.length) return;
    if (!confirm(`Deactivate ${targets.length} user${targets.length !== 1 ? 's' : ''}?`)) return;
    setBulkBusy(true); setMsg(null);
    const results = await runBulk(targets, async u => {
      const { data, error } = await supabase.rpc('admin_deactivate_user', { p_email: u.email });
      return { ok: !error && !data?.error, err: error?.message || data?.error };
    });
    const failed = results.filter(r => !r.ok).length;
    setMsg({ ok: failed === 0, text: failed === 0 ? `${targets.length} user${targets.length !== 1 ? 's' : ''} deactivated` : `${failed} of ${targets.length} failed to deactivate` });
    setBulkBusy(false); setSelected(new Set()); load(search);
  };

  const bulkDeleteWiki = async () => {
    const targets = selectedUsers;
    if (!targets.length) return;
    if (!confirm(`Delete all wiki entries by ${targets.length} user${targets.length !== 1 ? 's' : ''}?\n\nThis permanently removes all wiki content they authored.\n\nThis CANNOT be undone.`)) return;
    setBulkBusy(true); setMsg(null);
    const results = await runBulk(targets, async u => {
      const { data, error } = await supabase.rpc('admin_delete_user_wiki', { p_user_id: u.id });
      return { ok: !error && !data?.error, err: error?.message || data?.error, deleted: data?.deleted };
    });
    const failed = results.filter(r => !r.ok).length;
    const totalDeleted = results.reduce((s, r) => s + (r.deleted || 0), 0);
    setMsg({ ok: failed === 0, text: failed === 0 ? `${totalDeleted} wiki ${totalDeleted === 1 ? 'entry' : 'entries'} deleted across ${targets.length} user${targets.length !== 1 ? 's' : ''}` : `${failed} of ${targets.length} failed` });
    setBulkBusy(false); setSelected(new Set());
  };

  const bulkDeleteUsers = async () => {
    const targets = selectedUsers;
    if (!targets.length) return;
    if (!confirm(`PERMANENTLY DELETE ${targets.length} user${targets.length !== 1 ? 's' : ''}?\n\nThis deletes their Supabase accounts and ALL their workshop data — machines, clients, parts, vehicles, tools, everything.\n\nThis CANNOT be undone.`)) return;
    if (!confirm(`Second confirmation: delete ${targets.length} user${targets.length !== 1 ? 's' : ''} forever?`)) return;
    setBulkBusy(true); setMsg(null);
    const results = await runBulk(targets, async u => {
      const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: u.id });
      if (error || data?.error) return { ok: false, err: error?.message || data?.error };
      await deleteUserPhotos(u.id);
      return { ok: true };
    });
    const failed = results.filter(r => !r.ok).length;
    setMsg({ ok: failed === 0, text: failed === 0 ? `${targets.length} user${targets.length !== 1 ? 's' : ''} permanently deleted` : `${failed} of ${targets.length} failed to delete` });
    setBulkBusy(false); setSelected(new Set()); load(search);
  };

  const anyBusy = !!busy || bulkBusy;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Search email or name…" value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)} style={{ ...btnG, ...sm }}>Search</button>
        <button onClick={() => { setSearch(''); load(''); }} style={{ ...btnG, ...sm }}>All</button>
      </div>
      <Msg m={msg} />
      <Msg m={loadError ? { ok: false, text: loadError } : null} />

      {selectableUsers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: MUT, cursor: 'pointer', minHeight: 32 }}>
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            Select all ({selectableUsers.length})
          </label>
          {selected.size > 0 && (
            <>
              <button onClick={bulkDeactivate} disabled={anyBusy} style={{ ...rowBtn, minHeight: 34, padding: '7px 12px', opacity: anyBusy ? 0.5 : 1 }}>
                Deactivate ({selected.size})
              </button>
              <button onClick={bulkDeleteWiki} disabled={anyBusy} style={{ ...rowBtn, minHeight: 34, padding: '7px 12px', color: '#e8870a', borderColor: '#e8870a55', opacity: anyBusy ? 0.5 : 1 }}>
                Del Wiki ({selected.size})
              </button>
              <button onClick={bulkDeleteUsers} disabled={anyBusy} style={{ ...delBtn, minHeight: 34, padding: '7px 12px', fontSize: 10, opacity: anyBusy ? 0.5 : 1 }}>
                Delete ({selected.size})
              </button>
            </>
          )}
        </div>
      )}

      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 20 }}>Loading…</div>}
      {users.map(u => {
        const isProtected = ADMIN_EMAILS.includes(u.email);
        return (
        <div key={u.id} style={{ ...card, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {!isProtected && (
              <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)}
                style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: TXT, fontWeight: 700 }}>{u.display_name || u.username || '—'}</span>
              </div>
              <div style={{ fontSize: 9, color: MUT, marginBottom: 3 }}>{u.email}</div>
              <div style={{ fontSize: 8, color: '#333' }}>
                <span style={{ color: GRN }}>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                {u.last_sign_in_at && <> · <span style={{ color: RED }}>Last seen {new Date(u.last_sign_in_at).toLocaleDateString()}</span></>}
                {u.machine_count > 0 && <> · {u.machine_count} machine{u.machine_count !== 1 ? 's' : ''}</>}
              </div>
            </div>
          </div>
          {!isProtected && flagOptions.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {flagOptions.map(f => {
                const ov = overrides[u.id]?.[f.key];
                const value = ov === undefined ? 'default' : (ov ? 'on' : 'off');
                return (
                  <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: MUT }}>
                    {f.label}
                    <select value={value} onChange={e => setOverride(u.id, f.key, e.target.value)}
                      style={{ ...inp, fontSize: 9, padding: '4px 6px', width: 'auto',
                        color: value === 'on' ? GRN : value === 'off' ? RED : MUT }}>
                      <option value="default">Default</option>
                      <option value="on">On (beta)</option>
                      <option value="off">Off</option>
                    </select>
                  </label>
                );
              })}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            <button onClick={() => deactivate(u.email)} disabled={anyBusy} style={{ ...rowBtn, opacity: anyBusy ? 0.5 : 1 }}>
              Deactivate
            </button>
            <button onClick={() => deleteWiki(u)} disabled={anyBusy}
              style={{ ...rowBtn, color: '#e8870a', borderColor: '#e8870a55', opacity: anyBusy ? 0.5 : 1 }}>
              Del Wiki
            </button>
          </div>
          <button onClick={() => deleteUser(u)} disabled={anyBusy}
            style={{ ...delBtn, width: '100%', marginTop: 10, opacity: anyBusy ? 0.5 : 1 }}>
            Delete
          </button>
        </div>
        );
      })}
      {!loading && !loadError && users.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No users found.</div>
      )}
    </div>
  );
}

// ─── Feature Flags ───────────────────────────────────────────────────────────
// Launch-mode flags (see docs/FEATURE_MAP.md section 19 and
// supabase/launch_flags_admin.sql) get their own labeled, described section
// above the generic key/label CRUD list below — same feature_flags table,
// same toggle mechanism, just friendlier for the keys the app itself
// actually reads. Anything else an admin adds through "+ New Flag" is just
// a plain flag with no special app behavior wired to it (yet).
//
// invoices_free/free_seats used to live here too, gating the invoice-cap
// paywall and per-seat billing — both were deleted outright (code, RPCs,
// edge functions, and their feature_flags rows; see
// supabase/launch_flags_admin.sql) rather than left dormant. Rat Bench
// is free with no plan to bring per-seat/per-invoice billing back —
// monetization is planned via marketplace ads/sponsored listings instead.
// member_cap came back separately, same day (also launch_flags_admin.sql) —
// deleting the paywall had deleted the member-count-limit concept along
// with it, which turned out not to be intended; this is a plain
// abuse-prevention cap, nothing to do with billing.
const LAUNCH_FLAG_ORDER = ['community', 'wiki', 'marketplace', 'member_cap'];
const LAUNCH_FLAG_META = {
  community: {
    label: 'Community section (master switch)',
    desc: 'Overrides Wiki and Marketplace together, regardless of their own switches below — turn this off to hide the whole Community tab no matter what they say. Turning it back on doesn’t show anything by itself, it just stops overriding those two.',
  },
  wiki: {
    label: 'Wiki',
    desc: 'Wiki tab in Community, plus the public wiki.ratbench.net site. Off = hidden everywhere, including that subdomain. Also requires the master switch above to be on.',
  },
  marketplace: {
    label: 'Marketplace & Messages',
    desc: 'Marketplace and Messages tabs in Community, plus the public /marketplace and /listing pages. Messages has no use without Marketplace, so one switch covers both. Also requires the master switch above to be on.',
  },
  member_cap: {
    label: 'Team member limit',
    desc: 'On = every company is capped at the member count below (beyond the owner, who never counts against it) — a plain abuse-prevention limit, not tied to billing. Off = unlimited team members for every company.',
  },
};

function FlagsTab() {
  const [flags,    setFlags]    = useState([]);
  const [adding,   setAdding]   = useState(false);
  const [newKey,   setNewKey]   = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [msg,      setMsg]      = useState(null);

  const load = async () => {
    const { data } = await supabase.from('feature_flags').select('*').order('created_at');
    if (data) setFlags(data);
  };

  useEffect(() => { load(); }, []);

  // Every write below now checks {error} and (for update()) how many rows
  // actually changed — a write silently blocked by RLS (wrong auth.email(),
  // or the write policy never having been (re-)applied) previously looked
  // identical to a successful no-op change, since load() just re-fetched
  // the same unchanged data either way with nothing telling you why.
  const toggle = async (f) => {
    setMsg(null);
    const { data, error } = await supabase.from('feature_flags').update({ enabled: !f.enabled }).eq('id', f.id).select();
    if (error) { setMsg({ ok: false, text: `Couldn't update "${f.key}": ${error.message}` }); return; }
    if (!data?.length) { setMsg({ ok: false, text: `"${f.key}" wasn't updated — you may not have write access (check the admin email in the RLS policy matches your login).` }); return; }
    load();
  };

  const setNumericValue = async (f, value) => {
    setMsg(null);
    const { data, error } = await supabase.from('feature_flags').update({ value }).eq('id', f.id).select();
    if (error) { setMsg({ ok: false, text: `Couldn't update "${f.key}": ${error.message}` }); return; }
    if (!data?.length) { setMsg({ ok: false, text: `"${f.key}" wasn't updated — you may not have write access.` }); return; }
    load();
  };

  const add = async () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    setMsg(null);
    const { error } = await supabase.from('feature_flags').insert({
      key:   newKey.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newLabel.trim(),
    });
    if (error) { setMsg({ ok: false, text: `Couldn't add flag: ${error.message}` }); return; }
    setNewKey(''); setNewLabel(''); setAdding(false);
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this flag?')) return;
    setMsg(null);
    const { error } = await supabase.from('feature_flags').delete().eq('id', id);
    if (error) { setMsg({ ok: false, text: `Couldn't delete flag: ${error.message}` }); return; }
    load();
  };

  // Fixed display order (community first, as the master switch) rather than
  // DB row order — the seed INSERT writes all five rows in one statement, so
  // created_at ties don't reliably sort the way an admin would expect.
  const launchFlags = LAUNCH_FLAG_ORDER.map(key => flags.find(f => f.key === key)).filter(Boolean);
  const customFlags = flags.filter(f => !LAUNCH_FLAG_META[f.key]);

  return (
    <div>
      <Msg m={msg} />
      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Launch Mode</div>
      {launchFlags.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, marginBottom: 16 }}>
          None of the launch-mode rows exist yet — run supabase/launch_flags_admin.sql to seed them.
        </div>
      )}
      {launchFlags.map(f => (
        <div key={f.id} style={{ ...card, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: TXT, fontWeight: 700 }}>{LAUNCH_FLAG_META[f.key].label}</div>
              <div style={{ fontSize: 9, color: MUT, marginTop: 3, lineHeight: 1.5 }}>{LAUNCH_FLAG_META[f.key].desc}</div>
            </div>
            <button onClick={() => toggle(f)} style={{ ...btnG, ...sm, fontSize: 9, minWidth: 36, flexShrink: 0,
              color: f.enabled ? GRN : MUT, border: '1px solid ' + (f.enabled ? GRN : '#333') }}>
              {f.enabled ? 'ON' : 'OFF'}
            </button>
          </div>
          {f.key === 'member_cap' && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid ' + BRD, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: MUT }}>Member limit per company:</span>
              <input type="number" min="1" style={{ ...inp, width: 70, padding: '4px 8px', fontSize: 11 }}
                defaultValue={f.value ?? 10} key={f.value}
                onBlur={e => { const n = parseInt(e.target.value, 10); if (Number.isFinite(n) && n >= 1 && n !== f.value) setNumericValue(f, n); }} />
            </div>
          )}
        </div>
      ))}

      <div style={{ fontSize: 9, color: ACC, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, margin: '20px 0 10px' }}>Custom Flags</div>
      {customFlags.length === 0 && !adding && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No custom flags yet.</div>
      )}
      {customFlags.map(f => (
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

// ─── Wiki Reports ─────────────────────────────────────────────────────────────
// Photos auto-hidden after 3 community reports (report_wiki_photo RPC). Each
// resolution pays every reporter on that photo: +1 if they were right
// (removed), -1 if they weren't (cleared) — see resolve_wiki_photo_report.

function WikiReportsTab() {
  const [photos, setPhotos] = useState([]);
  const [reports, setReports] = useState({}); // photo_id -> unresolved report rows
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  const [docs, setDocs] = useState([]);
  const [docReports, setDocReports] = useState({}); // document_id -> unresolved report rows
  const [docBusy, setDocBusy] = useState(null);
  const [docMsg, setDocMsg] = useState(null);

  const load = async () => {
    const { data: hidden } = await supabase.from('wiki_entry_photos').select('*').eq('status', 'hidden').order('created_at');
    setPhotos(hidden || []);
    if (hidden?.length) {
      const { data: reps } = await supabase.from('wiki_photo_reports').select('*')
        .in('photo_id', hidden.map(p => p.id)).eq('resolved', false);
      const byPhoto = {};
      (reps || []).forEach(r => { (byPhoto[r.photo_id] ||= []).push(r); });
      setReports(byPhoto);
    } else {
      setReports({});
    }
  };

  const loadDocs = async () => {
    const { data: hidden } = await supabase.from('wiki_entry_documents').select('*').eq('status', 'hidden').order('created_at');
    setDocs(hidden || []);
    if (hidden?.length) {
      const { data: reps } = await supabase.from('wiki_document_reports').select('*')
        .in('document_id', hidden.map(d => d.id)).eq('resolved', false);
      const byDoc = {};
      (reps || []).forEach(r => { (byDoc[r.document_id] ||= []).push(r); });
      setDocReports(byDoc);
    } else {
      setDocReports({});
    }
  };

  useEffect(() => { load(); loadDocs(); }, []);

  const resolve = async (photoId, outcome) => {
    setBusy(photoId); setMsg(null);
    const { error } = await supabase.rpc('resolve_wiki_photo_report', { p_photo_id: photoId, p_outcome: outcome });
    setBusy(null);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    setMsg({ ok: true, text: outcome === 'removed' ? 'Photo removed — reporters credited +1 each.' : 'Photo cleared — reporters penalized -1 each.' });
    load();
  };

  const resolveDoc = async (documentId, outcome) => {
    setDocBusy(documentId); setDocMsg(null);
    const { error } = await supabase.rpc('resolve_wiki_document_report', { p_document_id: documentId, p_outcome: outcome });
    setDocBusy(null);
    if (error) { setDocMsg({ ok: false, text: error.message }); return; }
    setDocMsg({ ok: true, text: outcome === 'removed' ? 'Document removed — reporters credited +1 each.' : 'Document cleared — no penalty for reporters.' });
    loadDocs();
  };

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Photos</div>
      <Msg m={msg} />
      {photos.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No flagged photos.</div>}
      {photos.map(p => {
        const reps = reports[p.id] || [];
        return (
          <div key={p.id} style={{ ...card, marginBottom: 10, display: 'flex', gap: 12 }}>
            <img src={p.url} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 2, border: '1px solid ' + BRD, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: MUT, marginBottom: 4 }}>{reps.length} report{reps.length !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: 9, color: TXT, marginBottom: 8 }}>{reps.map(r => r.reason.replace(/_/g, ' ')).join(', ') || '—'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => resolve(p.id, 'removed')} disabled={busy === p.id} style={{ ...btnD, fontSize: 9, opacity: busy === p.id ? 0.5 : 1 }}>Remove Photo</button>
                <button onClick={() => resolve(p.id, 'cleared')} disabled={busy === p.id} style={{ ...btnG, ...sm, fontSize: 9, opacity: busy === p.id ? 0.5 : 1 }}>Clear (False Report)</button>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 8px' }}>Documents</div>
      <Msg m={docMsg} />
      {docs.length === 0 && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>No flagged documents.</div>}
      {docs.map(d => {
        const reps = docReports[d.id] || [];
        return (
          <div key={d.id} style={{ ...card, marginBottom: 10, display: 'flex', gap: 12 }}>
            <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, borderRadius: 2, border: '1px solid ' + BRD, flexShrink: 0, background: '#0a0a0a' }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: TXT, marginBottom: 4, wordBreak: 'break-all' }}>{d.filename}</div>
              <div style={{ fontSize: 9, color: MUT, marginBottom: 4 }}>{reps.length} report{reps.length !== 1 ? 's' : ''}</div>
              <div style={{ fontSize: 9, color: TXT, marginBottom: 8 }}>{reps.map(r => r.reason.replace(/_/g, ' ')).join(', ') || '—'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => resolveDoc(d.id, 'removed')} disabled={docBusy === d.id} style={{ ...btnD, fontSize: 9, opacity: docBusy === d.id ? 0.5 : 1 }}>Remove Document</button>
                <button onClick={() => resolveDoc(d.id, 'cleared')} disabled={docBusy === d.id} style={{ ...btnG, ...sm, fontSize: 9, opacity: docBusy === d.id ? 0.5 : 1 }}>Clear (False Report)</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Announcements ───────────────────────────────────────────────────────────

const EMPTY_ANN = { message: '', expires_at: '', link_url: '', link_label: '' };

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
              {a.expires_at && <>Expires {new Date(a.expires_at).toLocaleDateString()}</>}
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

// ─── Live Log ─────────────────────────────────────────────────────────────────
// A dmesg-style feed of "every action, by anyone": every create/update/delete
// across the app's main data tables (via the generic trigger in
// supabase/activity_log.sql) plus Supabase Auth's own login/logout/signup
// events, merged into one Realtime-subscribable table. Two modes: Live
// (default — auto-updating, last 24h) and Browse (pick any day + free-text
// search across retained history).

const ACTION_PREFIXES = ['', 'auth', 'machines', 'vehicles', 'equipment', 'tools', 'consumables', 'wiki_entries', 'wiki_revisions', 'services', 'machine_bookings', 'company_members', 'marketplace_listings', 'clients'];

function activityColor(action) {
  if (!action) return MUT;
  if (action.startsWith('auth.'))     return ACC;
  if (action.endsWith('.delete'))     return RED;
  if (action.endsWith('.update'))     return '#4a9eff';
  if (action.endsWith('.insert'))     return GRN;
  return MUT;
}

function ActivityRow({ a }) {
  const color = activityColor(a.action);
  return (
    <div style={{ padding: '7px 0', borderBottom: '1px solid ' + BRD, display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.action}</span>
        {a.actor_email && <span style={{ fontSize: 9, color: TXT, marginLeft: 8 }}>{a.actor_email}</span>}
        {a.detail && <span style={{ fontSize: 9, color: MUT, marginLeft: 6 }}>→ {a.detail}</span>}
      </div>
      <div style={{ fontSize: 8, color: MUT, flexShrink: 0 }}>{new Date(a.created_at).toLocaleString()}</div>
    </div>
  );
}

function LiveLogTab() {
  const [mode, setMode] = useState('live'); // 'live' | 'browse'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Browse-mode filters
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const MAX_LIVE_ROWS = 300;

  // Live mode: seed with the last 24h, then prepend anything new as it's
  // written. RLS on activity_log gates the Realtime subscription itself, so
  // this simply never receives rows if somehow rendered for a non-admin.
  useEffect(() => {
    if (mode !== 'live') return;
    let alive = true;
    setLoading(true); setError(null);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    listActivity({ since, limit: MAX_LIVE_ROWS })
      .then(rows => { if (alive) setEntries(rows); })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    const unsubscribe = subscribeToActivity(row => {
      setEntries(prev => [row, ...prev].slice(0, MAX_LIVE_ROWS));
    });
    return () => { alive = false; unsubscribe(); };
  }, [mode]);

  const runBrowseSearch = useCallback(() => {
    setLoading(true); setError(null);
    const since = new Date(date + 'T00:00:00').toISOString();
    const until = new Date(new Date(date + 'T00:00:00').getTime() + 24 * 60 * 60 * 1000).toISOString();
    listActivity({ since, until, search, action, limit: 500 })
      .then(setEntries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, search, action]);

  useEffect(() => { if (mode === 'browse') runBrowseSearch(); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setMode('live')} style={{ ...btnG, ...sm, ...(mode === 'live' ? { color: ACC, borderColor: ACC } : {}) }}>
          {mode === 'live' && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GRN, boxShadow: '0 0 6px ' + GRN, marginRight: 6, verticalAlign: 'middle' }} />}
          Live
        </button>
        <button onClick={() => setMode('browse')} style={{ ...btnG, ...sm, ...(mode === 'browse' ? { color: ACC, borderColor: ACC } : {}) }}>
          Browse / Search
        </button>
      </div>

      {mode === 'browse' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, width: 150 }} />
          <select value={action} onChange={e => setAction(e.target.value)} style={{ ...inp, width: 160 }}>
            {ACTION_PREFIXES.map(p => <option key={p} value={p}>{p === '' ? 'All actions' : p}</option>)}
          </select>
          <input style={{ ...inp, flex: 1, minWidth: 160 }} placeholder="Search actor, detail, action…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && runBrowseSearch()} />
          <button onClick={runBrowseSearch} style={{ ...btnG, ...sm }}>Search</button>
        </div>
      )}

      <Msg m={error ? { ok: false, text: error } : null} />
      {loading && <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 20 }}>Loading…</div>}
      {!loading && entries.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: 'center', padding: 24 }}>
          {mode === 'live' ? 'No activity in the last 24 hours.' : 'No activity found for this day.'}
        </div>
      )}
      {!loading && entries.map(a => <ActivityRow key={a.id} a={a} />)}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState('Overview');
  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid #252525', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {ADMIN_TABS.map((t, i, arr) => (
          <button key={t} onClick={() => setTab(t)} className="tab-btn" style={{
            background: 'none', border: 'none',
            borderBottom: tab === t ? '2px solid ' + ACC : '2px solid transparent',
            borderRadius: 0, color: tab === t ? ACC : MUT,
            fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '8px 12px', cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
            marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0,
          }}>{t}</button>
        ))}
      </div>
      {tab === 'Overview'      && <OverviewTab />}
      {tab === 'Users'         && <UsersTab />}
      {tab === 'Flags'         && <FlagsTab />}
      {tab === 'Wiki Reports'  && <WikiReportsTab />}
      {tab === 'Announcements' && <AnnouncementsTab />}
      {tab === 'Audit'         && <AuditTab />}
      {tab === 'Live Log'      && <LiveLogTab />}
    </div>
  );
}
