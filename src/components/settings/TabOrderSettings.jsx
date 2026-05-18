import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { TABS, WORKSHOP_TABS } from '../../lib/constants';
import { applyTabOrder } from '../../lib/tabOrder';

const secHd = { borderLeft: "2px solid " + ACC, paddingLeft: 8, fontSize: 10, color: TXT, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 };

const SETTINGS_TABS = [
  { id: 'profile',  label: 'Profile' },
  { id: 'company',  label: 'Company / Org' },
  { id: 'billing',  label: 'Billing' },
  { id: 'storage',  label: 'Storage' },
  { id: 'tabs',     label: '⇅ Tabs' },
  { id: 'users',    label: '👥 Users' },
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
            <button onClick={() => move(i, -1)} disabled={i === 0}
              style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === 0 ? '#333' : MUT, cursor: i === 0 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}>↑</button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
              style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === items.length - 1 ? '#333' : MUT, cursor: i === items.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}>↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkshopReorderList({ items, setItems, visible, setVisible }) {
  const move = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const toggleVisible = (id) => {
    const isVisible = visible.has(id);
    if (isVisible && visible.size === 1) return; // keep at least one
    const next = new Set(visible);
    isVisible ? next.delete(id) : next.add(id);
    setVisible(next);
  };

  return (
    <div style={{ border: '1px solid ' + BRD, borderRadius: 2, overflow: 'hidden' }}>
      {items.map((tab, i) => {
        const isVisible = visible.has(tab.id);
        return (
          <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: i % 2 === 0 ? 'transparent' : SURF, borderBottom: i < items.length - 1 ? '1px solid ' + BRD : 'none', opacity: isVisible ? 1 : 0.4 }}>
            <input type="checkbox" checked={isVisible} onChange={() => toggleVisible(tab.id)}
              style={{ accentColor: ACC, width: 13, height: 13, flexShrink: 0, cursor: 'pointer' }} />
            <span style={{ fontSize: 9, color: MUT, width: 14, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 10, color: TXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
            {i === 0 && isVisible && <span style={{ fontSize: 7, color: ACC, letterSpacing: '0.08em', flexShrink: 0 }}>DEFAULT</span>}
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0}
                style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === 0 ? '#333' : MUT, cursor: i === 0 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                style={{ background: 'none', border: '1px solid ' + BRD, borderRadius: 2, color: i === items.length - 1 ? '#333' : MUT, cursor: i === items.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '1px 6px', lineHeight: 1.4, fontFamily: "'IBM Plex Mono',monospace" }}>↓</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TabOrderSettings({ profile, setProfile }) {
  const saved = profile?.tab_order ?? {};

  const [main,     setMain]     = useState(() => applyTabOrder(TABS, saved.main));
  const [workshop, setWorkshop] = useState(() => applyTabOrder(WORKSHOP_TABS, saved.workshop));
  const [settings, setSettings] = useState(() => applyTabOrder(SETTINGS_TABS, saved.settings));
  const [workshopVisible, setWorkshopVisible] = useState(() => {
    const vis = saved.workshop_visible;
    return vis ? new Set(vis) : new Set(WORKSHOP_TABS.map(t => t.id));
  });

  const [saving, setSaving] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [err,    setErr]    = useState('');

  const save = async () => {
    setSaving(true); setErr(''); setSaved2(false);
    const tabOrder = {
      main:             main.map(t => t.id),
      workshop:         workshop.map(t => t.id),
      workshop_visible: [...workshopVisible],
      settings:         settings.map(t => t.id),
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
    setWorkshopVisible(new Set(WORKSHOP_TABS.map(t => t.id)));
    setSaved2(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={secHd}>Main Navigation</div>
        <div style={{ fontSize: 9, color: MUT, marginBottom: 8, lineHeight: 1.5 }}>The top tab bar. First tab opens by default.</div>
        <ReorderList items={main} setItems={setMain} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={secHd}>Workshop</div>
        <div style={{ fontSize: 9, color: MUT, marginBottom: 8, lineHeight: 1.5 }}>Check to show, uncheck to hide. First visible tab is the default.</div>
        <WorkshopReorderList items={workshop} setItems={setWorkshop} visible={workshopVisible} setVisible={setWorkshopVisible} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={secHd}>Settings</div>
        <div style={{ fontSize: 9, color: MUT, marginBottom: 8, lineHeight: 1.5 }}>Tabs inside the Settings screen.</div>
        <ReorderList items={settings} setItems={setSettings} />
      </div>

      {err    && <div style={{ fontSize: 9, color: RED, marginBottom: 8 }}>{err}</div>}
      {saved2 && <div style={{ fontSize: 9, color: GRN, marginBottom: 8 }}>Tab order saved.</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset} style={{ ...btnG, ...sm, fontSize: 9 }}>Reset to defaults</button>
        <button onClick={save} disabled={saving} style={{ ...btnA, ...sm, fontSize: 9, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
