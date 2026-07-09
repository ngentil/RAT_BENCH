import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, RED, BG, inp, btnA, btnG, sm } from '../../lib/styles';
import { WIKI_FIELD_LABELS, getWikiEntryBySlug, saveWikiFieldEdit, incrementViewCount, deleteWikiEntry, getEntryContributorCount, tokenizeSearch } from '../../lib/wiki';
import { upsertMachine } from '../../lib/db/machines';
import { hl } from './wikiSearchHighlight';

const LAST_QUERY_KEY = 'wikiSearchQuery';
// Recover the search term that led here — sessionStorage for the embedded
// (in-app) nav path, a "?q=" URL param for the standalone wiki-subdomain page.
function getIncomingSearchQuery(embedded) {
  if (embedded) return sessionStorage.getItem(LAST_QUERY_KEY) || "";
  try { return new URLSearchParams(window.location.search).get('q') || ""; }
  catch { return ""; }
}

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
  const [contributors, setContributors] = useState(0);

  // Admin field editing
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Import to garage
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    (async () => {
      const e = await getWikiEntryBySlug(slug);
      if (!alive) return; // stale response — user already navigated to another slug
      if (!e) { setNotFound(true); }
      else {
        setEntry(e);
        setRevData(e.currentRevision?.data || {});
        incrementViewCount(e.id);
        getEntryContributorCount(e.id).then(n => { if (alive) setContributors(n); });
        if (!embedded) document.title = `${e.make} ${e.model} — Rat Bench Wiki`;
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  // ── Admin editing ──────────────────────────────────────────────────────────
  const startEdit = (key) => {
    setEditingField(key);
    setEditValue(String(revData[key] ?? entry?.[key] ?? ""));
    setSaveErr("");
  };
  const cancelEdit = () => { setEditingField(null); setEditValue(""); setSaveErr(""); };
  const doSave = async () => {
    if (!isAdmin || !profile || !editingField) return;
    setSaving(true); setSaveErr("");
    try {
      const oldValue = revData[editingField] ?? entry?.[editingField] ?? "";
      await saveWikiFieldEdit(entry.id, revData, editingField, oldValue, editValue, profile);
      setRevData(d => ({ ...d, [editingField]: editValue }));
      setEditingField(null);
    } catch (e) { setSaveErr(e.message); }
    setSaving(false);
  };

  // ── Import to garage ───────────────────────────────────────────────────────
  // Old revisions (published before the strip-list was tightened) can still
  // contain the publisher's private photo URLs and job data — never copy those
  // into the importer's machine.
  const IMPORT_STRIP = [
    "id","userId","companyId","clientId","createdAt","updatedAt",
    "photos","iPPhotos","ePPhotos","jobPhotos",
    "parts","timeLog","jobTimers","dueDate",
    "lastServiceDate","lastServiceOdo","lastServiceNotes",
    "status","source","rage","notes",
    "submittedToWiki","wikiMachineId","tileFields","tileColors","expandFields",
  ];
  const doImport = async () => {
    setImporting(true);
    try {
      const { make, model, type, ...specOnly } = revData;
      IMPORT_STRIP.forEach(k => { delete specOnly[k]; });
      if (specOnly.carbSpec && typeof specOnly.carbSpec === "object") {
        const { gasketPhotos, purchaseLinks, ...carbRest } = specOnly.carbSpec;
        specOnly.carbSpec = carbRest;
      }
      await upsertMachine({
        make: entry.make,
        model: entry.model,
        type: typeof entry.type === "string" ? entry.type : "",
        ...specOnly,
      });
      setImportDone(true);
    } catch (e) {
      alert('Import failed: ' + e.message);
    }
    setImporting(false);
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

  // If you arrived here via a wiki search, keep that term highlighted across
  // every field on the page — same "show me what matched" idea as the Spec
  // Search tab, using the wiki's own plain-substring highlight.
  const searchTokens = tokenizeSearch(getIncomingSearchQuery(embedded));

  // Last revision metadata
  const rev = entry.currentRevision;
  const lastEditor = rev?.username;
  const lastEditDate = rev?.created_at
    ? new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

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
              <div style={{ fontSize: 14, fontWeight: 700, color: TXT }}>{hl(entry.make, searchTokens)} <span style={{ color: ACC }}>{hl(entry.model, searchTokens)}</span></div>
            </div>
            {entry.type && <div style={{ display: "inline-block", fontSize: 8, color: ACC, background: ACC + "12", border: "1px solid " + ACC + "33", padding: "1px 6px", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>{hl(entry.type, searchTokens)}</div>}
          </div>
        )}

        {/* Top bar: views, attribution, actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {embedded && <button onClick={onBack} style={{ ...btnG, ...sm, fontSize: 9 }}>← Wiki</button>}
            <span style={{ fontSize: 9, color: MUT }}>{entry.view_count || 0} views</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {embedded
              ? <a href={`https://wiki.ratbench.net/${slug}/history`} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History ↗</a>
              : <a href={"/" + slug + "/history"} style={{ fontSize: 9, color: MUT, textDecoration: "none", border: "1px solid " + BRD, padding: "4px 8px" }}>History</a>
            }
            {/* Import to garage */}
            {profile && !importDone && (
              <button
                onClick={doImport}
                disabled={importing}
                style={{ ...btnA, ...sm, fontSize: 9, opacity: importing ? 0.6 : 1 }}
              >
                {importing ? "Adding…" : "＋ Add to Garage"}
              </button>
            )}
            {importDone && (
              <span style={{ fontSize: 9, color: ACC, border: "1px solid " + ACC + "44", padding: "4px 8px" }}>✓ Added to garage</span>
            )}
            {/* Admin delete */}
            {isAdmin && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete wiki entry "${entry.make} ${entry.model}"? This cannot be undone.`)) return;
                  await deleteWikiEntry(entry.id);
                  onBack ? onBack() : (window.location.href = '/');
                }}
                style={{ fontSize: 9, color: RED, border: '1px solid ' + RED + '55', background: RED + '11', padding: '4px 8px', borderRadius: 2, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}
              >🗑 Delete</button>
            )}
          </div>
        </div>

        {/* Last updated attribution */}
        {lastEditor && lastEditDate && (
          <div style={{ fontSize: 8, color: MUT, marginBottom: 14, letterSpacing: "0.06em" }}>
            Last updated by <span style={{ color: TXT }}>{lastEditor}</span> · {lastEditDate}
            {rev?.edit_summary && rev.edit_summary !== 'Updated specs' && (
              <span style={{ opacity: 0.7 }}> · {rev.edit_summary}</span>
            )}
          </div>
        )}

        {/* Social proof — distinct mechanics who've contributed */}
        {contributors > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 8, color: ACC, background: ACC + "11", border: "1px solid " + ACC + "33", borderRadius: 2, padding: "3px 8px", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>
            ✓ Specs confirmed by {contributors} mechanic{contributors !== 1 ? "s" : ""}
          </div>
        )}

        {fields.length === 0 && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>
            No spec data yet.{isAdmin ? " Click any field below to add it." : ""}
          </div>
        )}

        {/* Spec fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(fields.length > 0 ? fields : allFields).map(([k, label]) => {
            const value = revData[k] ?? entry?.[k];
            const isEditing = editingField === k;
            const hasValue = value != null && value !== "" && value !== false;
            const isNotes = k === "notes";

            return (
              <div key={k} style={{ background: SURF, border: "1px solid " + (isEditing ? ACC : BRD), borderRadius: 2, padding: isNotes ? "12px 16px" : "8px 12px", gridColumn: isNotes ? "1 / -1" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isEditing ? 6 : 2 }}>
                  <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
                  {/* Only admins see the inline edit button */}
                  {isAdmin && !isEditing && (
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
                  <div style={{
                    fontSize: isNotes ? 14 : 12,
                    lineHeight: isNotes ? 1.65 : 1.3,
                    color: hasValue ? TXT : MUT,
                    fontStyle: hasValue ? "normal" : "italic",
                    whiteSpace: isNotes ? "pre-wrap" : undefined,
                  }}>
                    {hasValue ? hl(String(value), searchTokens) : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contribution disclaimer */}
        <div style={{ marginTop: 20, padding: "12px 14px", border: "1px solid " + RED + "55", borderLeft: "3px solid " + RED, borderRadius: 2, background: RED + "14" }}>
          <div style={{ fontSize: 9, color: RED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Is this information correct?</div>
          <div style={{ fontSize: 9, color: RED, lineHeight: 1.6 }}>
            To contribute a correction or additional specs, add this machine to your garage using{" "}
            <strong style={{ color: TXT }}>+ Add to Garage</strong>, fill in any missing details, then tap{" "}
            <strong style={{ color: TXT }}>Push to Wiki</strong> on your machine. Your update will appear here with your name attached.
          </div>
        </div>
      </div>
    </div>
  );
}

export default WikiEntryPage;
