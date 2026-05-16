import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { TABS, WORKSHOP_TABS } from '../../lib/constants';
import { applyTabOrder } from '../../lib/tabOrder';

const secHd = { borderLeft: "2px solid " + ACC, paddingLeft: 8, fontSize: 10, color: TXT, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 };

const SETTINGS_TABS = [
  { id: 'profile',   label: 'Profile' },
  { id: 'company',   label: 'Company / Org' },
  { id: 'billing',   label: 'Billing' },
  { id: 'storage',   label: 'Storage' },
  { id: 'workshop',  label: '🔨 Workshop' },
  { id: 'users',     label: '👥 Users' },
  { id: 'tabs',      label: '⇅ Tabs' },
];

const GROUPS = [
  {
    key: 'main',
    label: 'Main Navigation',
    desc: 'The top tab bar (Tracker, Jobs, etc.)',
    tabs: TABS,
  },
  {
    key: 'workshop',
    label: 'Workshop',
    desc: 'Workshop sub-tabs. Visibility is set separately under Workshop preferences.',
    tabs: WORKSHOP_TABS,
  },
  {
    key: 'settings',
    label: 'Settings',
    desc: 'Tabs inside the Settings screen.',
    tabs: SETTINGS_TABS,
  },
];

function ReorderList({ items, setItems }) {
  const move = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  return (
    <div style={{ border: '1px solid ' + BRD, borderRadius: 2, overflow: 'hidden' }}>
      {items.map((tab, i) => (
        <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: i % 2 === 0 ? 'transparent' : SURF, borderBottom: i < items.length - 1 ? '1px solid ' + BRD : 'none' }}>
          <span style={{ fontSize: 9, color: MUT, width: 14, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ fontSize: 10, color: TXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === 0 ? '#333' : MUT, cursor: i === 0 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}
            >↑</button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === items.length - 1 ? '#333' : MUT, cursor: i === items.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}
            >↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TabOrderSettings({ profile, setProfile }) {
  const saved = profile?.tab_order ?? {};

  const initGroup = (key, allTabs) => applyTabOrder(allTabs, saved[key]);

  const [main,     setMain]     = useState(() => initGroup('main',     TABS));
  const [workshop, setWorkshop] = useState(() => initGroup('workshop', WORKSHOP_TABS));
  const [settings, setSettings] = useState(() => initGroup('settings', SETTINGS_TABS));

  const [saving, setSaving] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [err,    setErr]    = useState('');

  const save = async () => {
    setSaving(true); setErr(''); setSaved2(false);
    const tabOrder = {
      main:     main.map(t => t.id),
      workshop: workshop.map(t => t.id),
      settings: settings.map(t => t.id),
    };
    const { error } = await supabase.from('profiles').update({ tab_order: tabOrder }).eq('id', profile.id);
    if (error) { setErr(error.message); setSaving(false); return; }
    setProfile(prev => ({ ...prev, tab_order: tabOrder }));
    setSaved2(true);
    setSaving(false);
  };

  const reset = () => {
    setMain(TABS);
    setWorkshop(WORKSHOP_TABS);
    setSettings(SETTINGS_TABS);
    setSaved2(false);
  };

  return (
    <div>
      {GROUPS.map(({ key, label, desc, tabs: allTabs }) => {
        const [items, setItems] = key === 'main' ? [main, setMain] : key === 'workshop' ? [workshop, setWorkshop] : [settings, setSettings];
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={secHd}>{label}</div>
            <div style={{ fontSize: 9, color: MUT, marginBottom: 8, lineHeight: 1.5 }}>{desc}</div>
            <ReorderList items={items} setItems={setItems} />
          </div>
        );
      })}

      {err    && <div style={{ fontSize: 9, color: RED, marginBottom: 8 }}>{err}</div>}
      {saved2 && <div style={{ fontSize: 9, color: GRN, marginBottom: 8 }}>Tab order saved.</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset} style={{ ...btnG, ...sm, fontSize: 9 }}>Reset to defaults</button>
        <button onClick={save} disabled={saving} style={{ ...btnA, ...sm, fontSize: 9, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save order'}
        </button>
      </div>
    </div>
  );
}
