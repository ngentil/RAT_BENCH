import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, BG, inp, btnA, btnG, sm } from '../../lib/styles';
import { WIKI_FIELD_LABELS, getWikiEntryBySlug, saveWikiFieldEdit, incrementViewCount, deleteWikiEntry } from '../../lib/wiki';

const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL, 'nathan.gentil.ai@gmail.com', 'nathan.gentil@gmail.com'].filter(Boolean);

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

function WikiEntryPage({ slug, session, profile, onBack, embedded = false }) {
  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email);
  const [entry, setEntry] = useState(null);
  const [revData, setRevData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    (async () => {
      const e = await getWikiEntryBySlug(slug);
      if (!e) { setNotFound(true); }
      else {
        setEntry(e);
        setRevData(e.currentRevision?.data || {});
        incrementViewCount(e.id);
      }
      setLoading(false);
    })();
  }, [slug]);

  const startEdit = (key) => {
    setEditingField(key);
    setEditValue(String(revData[key] ?? entry?.[key] ?? ""));
    setSaveErr("");
  };

  const cancelEdit = () => { setEditingField(null); setEditValue(""); setSaveErr(""); };

  const doSave = async () => {
    if (!profile || !editingField) return;
    setSaving(true); setSaveErr("");
    try {
      const oldValue = revData[editingField] ?? entry?.[editingField] ?? "";
      await saveWikiFieldEdit(entry.id, revData, editingField, oldValue, editValue, profile);
      setRevData(d => ({ ...d, [editingField]: editValue }));
      setEditingField(null);
    } catch (e) { setSaveErr(e.message); }
    setSaving(false);
  };

  const fieldInp = { ...inp, width: "100%", boxSizing: "border-box" };

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

  const fields = Object.entries(WIKI_FIELD_LABELS).filter(([k]) => {
    const v = revData[k] ?? entry?.[k];
    return v != null && v !== "" && v !== false;
  });

  const allFields = Object.entries(WIKI_FIELD_LABELS);

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
        {embedded && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{entry.make} <span style={{ color: entry.is_sample ? "#888" : ACC }}>{entry.model}</span></div>
              {entry.is_sample && <span style={{ fontSize: 7, color: "#666", border: "1px solid #333", padding: "1px 6px", borderRadius: 2, letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>sample</span>}
            </div>
            {entry.type && <div style={{ display: "inline-block", fontSize: 8, color: entry.is_sample ? "#666" : ACC, background: (entry.is_sample ? "#333" : ACC) + "12", border: "1px solid " + (entry.is_sample ? "#333" : ACC) + "33", padding: "1px 6px", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>{entry.type}</div>}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {embedded && <button onClick={onBack} style={{ ...btnG, ...sm, fontSize: 9 }}>← Wiki</button>}
            <span style={{ fontSize: 9, color: MUT }}>{entry.view_count || 0} views</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {embedded
              ? <a href={`https://wiki.ratbench.net/${slug}/history`} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History ↗</a>
              : <a href={"/" + slug + "/history"} style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History</a>
            }
            {!profile && <span style={{ fontSize: 9, color: MUT }}>Log in to edit</span>}
            {(isAdmin || (entry.is_sample && entry.sample_owner_id === profile?.id)) && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete wiki entry "${entry.make} ${entry.model}"? This cannot be undone.`)) return;
                  await deleteWikiEntry(entry.id);
                  onBack();
                }}
                style={{ fontSize: 9, color: RED, border: '1px solid ' + RED + '55', background: RED + '11', padding: '4px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}
              >🗑 {entry.is_sample ? "Remove Sample" : "Delete Entry"}</button>
            )}
          </div>
        </div>

        {fields.length === 0
          ? <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>No spec data yet.{profile ? " Click any field below to add it." : " Log in to contribute."}</div>
          : null
        }

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(fields.length > 0 ? fields : allFields).map(([k, label]) => {
            const value = revData[k] ?? entry?.[k];
            const isEditing = editingField === k;
            const hasValue = value != null && value !== "" && value !== false;

            return (
              <div key={k} style={{ background: SURF, border: "1px solid " + (isEditing ? ACC : BRD), borderRadius: 2, padding: "8px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isEditing ? 6 : 2 }}>
                  <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                  {profile && !isEditing && (
                    <button
                      onClick={() => startEdit(k)}
                      style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, opacity: 0.5 }}
                      title="Edit this field"
                    >✏</button>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={ev => setEditValue(ev.target.value)}
                      onKeyDown={ev => { if (ev.key === "Enter") doSave(); if (ev.key === "Escape") cancelEdit(); }}
                      style={fieldInp}
                    />
                    <div style={{ fontSize: 8, color: MUT, marginTop: 5, marginBottom: 6, lineHeight: 1.4, opacity: 0.7 }}>
                      Your username will be tied to this edit and visible to all users.
                    </div>
                    {saveErr && <div style={{ fontSize: 9, color: RED, marginBottom: 6 }}>{saveErr}</div>}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={doSave} disabled={saving} style={{ ...btnA, ...sm, fontSize: 9, opacity: saving ? 0.6 : 1 }}>
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit} style={{ ...btnG, ...sm, fontSize: 9 }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: hasValue ? TXT : MUT, fontStyle: hasValue ? "normal" : "italic" }}>
                    {hasValue ? String(value) : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WikiEntryPage;
