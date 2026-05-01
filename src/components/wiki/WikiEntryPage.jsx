import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, BG, inp, btnA, btnG, sm } from '../../lib/styles';
import { WIKI_FIELD_LABELS, getWikiEntryBySlug, saveWikiRevision, incrementViewCount } from '../../lib/wiki';

// Shared header used by standalone wiki pages (wiki.ratbench.net)
export function WikiHeader({ title, subtitle, backHref, backLabel }) {
  return (
    <div style={{ background: SURF, borderBottom: "2px solid " + ACC, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>🐀</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: ACC, letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>{subtitle}</div>}
      </div>
      {backHref && <a href={backHref} style={{ fontSize: 9, color: MUT, textDecoration: "none", letterSpacing: "0.06em" }}>{backLabel || "← Back"}</a>}
    </div>
  );
}

// Entry display used both standalone and embedded in the app's Wiki tab
function WikiEntryPage({ slug, profile, onBack, embedded = false }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    (async () => {
      const e = await getWikiEntryBySlug(slug);
      if (!e) { setNotFound(true); }
      else { setEntry(e); incrementViewCount(e.id); }
      setLoading(false);
    })();
  }, [slug]);

  const startEdit = () => {
    const d = entry.currentRevision?.data || {};
    setForm(Object.fromEntries(Object.keys(WIKI_FIELD_LABELS).map(k => [k, d[k] ?? entry[k] ?? ""])));
    setSummary(""); setSaveErr(""); setEditing(true);
  };

  const doSave = async () => {
    if (!summary.trim()) { setSaveErr("Edit summary required."); return; }
    setSaving(true); setSaveErr("");
    try {
      const rev = await saveWikiRevision(entry.id, form, summary, profile);
      setEntry(e => ({ ...e, currentRevision: rev }));
      setEditing(false);
    } catch (e) { setSaveErr(e.message); }
    setSaving(false);
  };

  const fieldInp = { width: "100%", boxSizing: "border-box", background: BG, border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "5px 8px", borderRadius: 2, outline: "none" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ fontSize: 10, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Loading…</div>
    </div>
  );

  if (notFound) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
      <div style={{ fontSize: 11, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Entry not found.</div>
      {embedded
        ? <button onClick={onBack} style={{ ...btnG, ...sm }}>← Back to Wiki</button>
        : <a href="/" style={{ fontSize: 10, color: ACC }}>← Back to wiki</a>}
    </div>
  );

  const revData = entry.currentRevision?.data || {};
  const fields = Object.entries(WIKI_FIELD_LABELS).filter(([k]) => {
    const v = revData[k] ?? entry[k];
    return v != null && v !== "" && v !== false;
  });

  return (
    <div style={embedded ? {} : { minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      {!embedded && (
        <WikiHeader
          title={`${entry.make} ${entry.model}`}
          subtitle="Rat Bench Wiki"
          backHref="/"
          backLabel="← Wiki"
        />
      )}
      <div style={{ maxWidth: embedded ? "none" : 680, margin: embedded ? 0 : "0 auto", padding: embedded ? "0 0 24px" : "24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {embedded && <button onClick={onBack} style={{ ...btnG, ...sm, fontSize: 9 }}>← Wiki</button>}
            <span style={{ fontSize: 10, color: MUT }}>{entry.view_count || 0} views</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {embedded
              ? <a href={`https://wiki.ratbench.net/${slug}/history`} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History ↗</a>
              : <a href={"/" + slug + "/history"} style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History</a>
            }
            {profile
              ? editing
                ? <button onClick={() => setEditing(false)} style={{ ...btnG, ...sm, fontSize: 9 }}>Cancel</button>
                : <button onClick={startEdit} style={{ ...btnG, ...sm, fontSize: 9, borderColor: ACC, color: ACC }}>Edit</button>
              : <span style={{ fontSize: 9, color: MUT }}>Log in to edit</span>
            }
          </div>
        </div>

        {editing ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {Object.entries(WIKI_FIELD_LABELS).map(([k, label]) => (
                <div key={k}>
                  <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                  <input value={form[k] || ""} onChange={ev => setForm(f => ({ ...f, [k]: ev.target.value }))} style={fieldInp} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Edit Summary *</div>
              <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="What did you change?" style={{ ...fieldInp, width: "100%" }} />
            </div>
            {saveErr && <div style={{ fontSize: 10, color: RED, marginBottom: 8 }}>{saveErr}</div>}
            <button onClick={doSave} disabled={saving} style={{ ...btnA, fontSize: 10, padding: "8px 20px", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <>
            {fields.length === 0
              ? <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>No spec data yet. Be the first to add it.</div>
              : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {fields.map(([k, label]) => (
                  <div key={k} style={{ background: SURF, border: "1px solid " + BRD, padding: "8px 12px", borderRadius: 2 }}>
                    <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: TXT }}>{String(revData[k] ?? entry[k])}</div>
                  </div>
                ))}
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
}

export default WikiEntryPage;
