import React, { useState, useEffect, useMemo } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL, Empty } from '../ui/shared';
import UpgradeBanner from '../ui/UpgradeBanner';
import PhotoAdder from '../ui/PhotoAdder';
import { effectiveTier, atAssetLimit, assetLimit } from '../../lib/gates';
import { getTools, saveToolItem, deleteToolItem } from '../../lib/db/tools';
import { fmtDate, fmtMoney } from '../../lib/helpers';
import LoadoutSection from '../ui/LoadoutSection';
import AssetTile from '../ui/AssetTile';

const TOOL_CATEGORIES = [
  "Power Tools", "Hand Tools", "Measuring & Diagnostic",
  "Specialty", "Lifting & Safety", "Other",
];
const TOOL_CONDITIONS = ["New", "Good", "Fair", "Poor"];
const COND_COL = { New: "#3d9e50", Good: "#3a7bd5", Fair: "#e8870a", Poor: "#c94040" };

const TOOL_SORT_OPTS = [
  { k: 'name_az',  l: 'Name A → Z' },
  { k: 'name_za',  l: 'Name Z → A' },
  { k: 'condition',l: 'Condition' },
  { k: 'category', l: 'Category' },
  { k: 'newest',   l: 'Date Added (Newest)' },
  { k: 'oldest',   l: 'Date Added (Oldest)' },
  { k: 'price_hi', l: 'Purchase Price (Highest)' },
  { k: 'warranty', l: 'Warranty Expiry (Soonest)' },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

const EMPTY_FORM = {
  name: "", brand: "", model: "", category: "", condition: "Good",
  purchaseDate: "", purchasePrice: "", warrantyExpiry: "",
  storageLocation: "", notes: "", photos: [],
};

function ToolForm({ tool, onSave, onCancel }) {
  const isEdit = !!tool?.id;
  const [f, setF] = useState(tool ? {
    name:            tool.name            || "",
    brand:           tool.brand           || "",
    model:           tool.model           || "",
    category:        tool.category        || "",
    condition:       tool.condition       || "Good",
    purchaseDate:    tool.purchaseDate    || "",
    purchasePrice:   tool.purchasePrice   ? String(tool.purchasePrice) : "",
    warrantyExpiry:  tool.warrantyExpiry  || "",
    storageLocation: tool.storageLocation || "",
    notes:           tool.notes           || "",
    photos:          tool.photos          || [],
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await onSave({ ...tool, ...f, name: f.name.trim(), brand: f.brand.trim(), model: f.model.trim(), purchasePrice: parseFloat(f.purchasePrice) || 0 });
    } catch (e) {
      setErr(e?.message || 'Save failed — check your connection');
      setSaving(false);
    }
  };

  return (
    <div style={ovly} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...mdl, maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {isEdit ? "Edit Tool" : "Add Tool"}
          </b>
          <button style={{ ...btnG, ...sm }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ ...mdlB, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <FL t="Tool name *" />
            <input style={inp} value={f.name} onChange={e => s("name", e.target.value)} placeholder="e.g. Angle Grinder" autoFocus />
          </div>
          <div><FL t="Brand" /><input style={inp} value={f.brand} onChange={e => s("brand", e.target.value)} placeholder="e.g. Makita" /></div>
          <div><FL t="Model" /><input style={inp} value={f.model} onChange={e => s("model", e.target.value)} placeholder="e.g. GA5030" /></div>
          <div>
            <FL t="Category" />
            <select style={sel} value={f.category} onChange={e => s("category", e.target.value)}>
              <option value="">— select —</option>
              {TOOL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <FL t="Condition" />
            <select style={sel} value={f.condition} onChange={e => s("condition", e.target.value)}>
              {TOOL_CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><FL t="Purchase date" /><input style={inp} type="date" value={f.purchaseDate} onChange={e => s("purchaseDate", e.target.value)} /></div>
          <div><FL t="Purchase price ($)" /><input style={inp} type="number" min="0" step="0.01" value={f.purchasePrice} onChange={e => s("purchasePrice", e.target.value)} placeholder="0.00" /></div>
          <div style={{ gridColumn: "1/-1" }}>
            <FL t="Warranty expires" />
            <input style={{ ...inp, width: "calc(50% - 5px)", boxSizing: "border-box" }} type="date" value={f.warrantyExpiry} onChange={e => s("warrantyExpiry", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <FL t="Storage location" />
            <input style={inp} value={f.storageLocation} onChange={e => s("storageLocation", e.target.value)} placeholder="e.g. Top box, middle drawer" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <FL t="Notes" />
            <textarea style={{ ...txa, minHeight: 50 }} value={f.notes} onChange={e => s("notes", e.target.value)} placeholder="e.g. 115mm disc, 11,000 RPM" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <PhotoAdder photos={f.photos} setPhotos={ps => s("photos", typeof ps === "function" ? ps(f.photos) : ps)} label="Photos" />
          </div>
        </div>
        {err && <div style={{ padding: '8px 16px', color: '#ff6b6b', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>⚠ {err}</div>}
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: f.name.trim() && !saving ? 1 : 0.4 }} disabled={!f.name.trim() || saving} onClick={save}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Tool"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, onEdit, onDelete, onUpdate, isShared }) {
  const [open, setOpen] = useState(false);
  const [loanForm, setLoanForm] = useState(false);
  const [loanName, setLoanName] = useState("");
  const [photoIdx, setPhotoIdx] = useState(null);
  const [addSvc, setAddSvc] = useState(false);
  const [svcForm, setSvcForm] = useState({ date: new Date().toISOString().slice(0, 10), notes: "", cost: "" });

  const isLoaned = !!tool.loanedTo;
  const condColor = COND_COL[tool.condition] || MUT;
  const warrantyDays = daysUntil(tool.warrantyExpiry);
  const warrantyExpired = warrantyDays !== null && warrantyDays < 0;
  const warrantyWarn = warrantyDays !== null && warrantyDays >= 0 && warrantyDays <= 30;

  const markLoaned = async () => {
    if (!loanName.trim()) return;
    await onUpdate({ ...tool, loanedTo: loanName.trim(), loanedAt: new Date().toISOString() });
    setLoanForm(false);
    setLoanName("");
  };

  const markReturned = async () => onUpdate({ ...tool, loanedTo: null, loanedAt: null });

  const addServiceEntry = async () => {
    if (!svcForm.notes.trim()) return;
    const entry = { id: crypto.randomUUID(), date: svcForm.date, notes: svcForm.notes.trim(), cost: parseFloat(svcForm.cost) || 0 };
    await onUpdate({ ...tool, serviceLog: [...(tool.serviceLog || []), entry] });
    setAddSvc(false);
    setSvcForm({ date: new Date().toISOString().slice(0, 10), notes: "", cost: "" });
  };

  const removeSvcEntry = async (id) => {
    if (!confirm("Remove this entry?")) return;
    await onUpdate({ ...tool, serviceLog: (tool.serviceLog || []).filter(e => e.id !== id) });
  };

  const borderAccent = isLoaned ? ACC : isShared ? ACC + "88" : condColor;

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid " + (isLoaned ? ACC + "55" : isShared ? ACC + "33" : "#252525"), borderLeft: "3px solid " + borderAccent, borderRadius: 2, marginBottom: 6, overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer" }}>
        {tool.photos?.[0] && (
          <img src={tool.photos[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 2, flexShrink: 0, border: "1px solid #252525" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{tool.name}</span>
            {tool.condition && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 7, color: condColor, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: condColor, display: "inline-block" }} />
                {tool.condition}
              </span>
            )}
            {isLoaned && (
              <span style={{ fontSize: 7, color: ACC, background: ACC + "18", border: "1px solid " + ACC + "55", borderRadius: 2, padding: "1px 5px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                ↗ {tool.loanedTo}
              </span>
            )}
            {isShared && (
              <span style={{ fontSize: 7, color: ACC, border: "1px solid " + ACC + "55", borderRadius: 2, padding: "1px 4px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                Shared
              </span>
            )}
            {warrantyWarn && !warrantyExpired && (
              <span style={{ fontSize: 7, color: ACC, letterSpacing: "0.06em" }}>⚠ {warrantyDays}d warranty</span>
            )}
            {warrantyExpired && (
              <span style={{ fontSize: 7, color: RED, letterSpacing: "0.06em" }}>✕ warranty expired</span>
            )}
          </div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {[tool.brand, tool.model].filter(Boolean).join(" · ")}
            {tool.category && <span style={{ marginLeft: 6, color: ACC + "99" }}>{tool.category}</span>}
            {tool.storageLocation && <span style={{ marginLeft: 6, color: MUT }}>· {tool.storageLocation}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {tool.purchasePrice > 0 && (
            <div style={{ fontSize: 10, color: GRN, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
              {fmtMoney(tool.purchasePrice)}
            </div>
          )}
          {tool.serviceLog?.length > 0 && (
            <div style={{ fontSize: 7, color: MUT, marginTop: 1 }}>{tool.serviceLog.length} svc</div>
          )}
        </div>
        <span style={{ fontSize: 9, color: MUT, flexShrink: 0, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="card-expand" style={{ padding: "0 12px 12px", borderTop: "1px solid #1a1a1a" }}>
          {tool.photos?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 10 }}>
              {tool.photos.map((p, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={p} alt="" onClick={() => setPhotoIdx(i)}
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 2, border: i === 0 ? "1px solid " + ACC + "88" : "1px solid #252525", cursor: "pointer", display: "block" }} />
                  <button
                    title={i === 0 ? "Cover photo" : "Set as cover"}
                    onClick={e => { e.stopPropagation(); if (i === 0) return; const reordered = [p, ...tool.photos.filter((_, j) => j !== i)]; onUpdate({ ...tool, photos: reordered }); }}
                    style={{ position: "absolute", top: 2, left: 2, background: i === 0 ? ACC : "rgba(0,0,0,0.7)", border: "none", borderRadius: 2, cursor: i === 0 ? "default" : "pointer", fontSize: 8, padding: "1px 3px", color: i === 0 ? "#000" : MUT, lineHeight: 1 }}>
                    {i === 0 ? "⭐" : "☆ Cover"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {tool.purchaseDate && (
              <div>
                <div style={{ fontSize: 7, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Purchased</div>
                <div style={{ fontSize: 10, color: TXT }}>{fmtDate(tool.purchaseDate)}</div>
              </div>
            )}
            {tool.warrantyExpiry && (
              <div>
                <div style={{ fontSize: 7, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Warranty</div>
                <div style={{ fontSize: 10, color: warrantyExpired ? RED : warrantyWarn ? ACC : TXT }}>
                  {fmtDate(tool.warrantyExpiry)}
                  {warrantyDays !== null && !warrantyExpired && (
                    <span style={{ marginLeft: 5, fontSize: 8, color: warrantyWarn ? ACC : MUT }}>({warrantyDays}d left)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {tool.notes && (
            <div style={{ marginTop: 8, fontSize: 10, color: MUT, lineHeight: 1.5, background: "#0a0a0a", padding: "6px 8px", borderRadius: 2, border: "1px solid #1a1a1a" }}>
              {tool.notes}
            </div>
          )}

          {/* Loaned out */}
          {!isShared && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 7, color: ACC, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Loaned Out</div>
              {isLoaned ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: ACC }}>
                    Loaned to <b>{tool.loanedTo}</b>
                    {tool.loanedAt && <span style={{ color: MUT, fontSize: 8, marginLeft: 6 }}>since {fmtDate(tool.loanedAt)}</span>}
                  </span>
                  <button onClick={markReturned} style={{ ...btnA, ...sm, background: GRN, borderColor: GRN, color: "#000" }}>Mark Returned</button>
                </div>
              ) : loanForm ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input style={{ ...inp, flex: 1 }} placeholder="Who's borrowing it?" value={loanName} onChange={e => setLoanName(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && markLoaned()} />
                  <button onClick={markLoaned} style={{ ...btnA, ...sm }}>Save</button>
                  <button onClick={() => { setLoanForm(false); setLoanName(""); }} style={{ ...btnG, ...sm }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setLoanForm(true)} style={{ ...btnG, ...sm }}>Mark as Loaned</button>
              )}
            </div>
          )}

          {/* Service log */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
              Service / Repair Log {tool.serviceLog?.length > 0 && `(${tool.serviceLog.length})`}
            </div>
            {(tool.serviceLog || []).map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0 6px 10px", borderBottom: "1px solid #1a1a1a", borderLeft: "2px solid " + ACC + "33", marginLeft: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACC + "66", flexShrink: 0, marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: MUT }}>{fmtDate(e.date)}</div>
                  <div style={{ fontSize: 10, color: TXT, marginTop: 2, lineHeight: 1.4 }}>{e.notes}</div>
                  {e.cost > 0 && <div style={{ fontSize: 8, color: GRN, marginTop: 2 }}>{fmtMoney(e.cost)}</div>}
                </div>
                {!isShared && <button onClick={() => removeSvcEntry(e.id)} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>}
              </div>
            ))}
            {!isShared && (addSvc ? (
              <div style={{ background: "#0a0a0a", border: "1px solid " + ACC + "44", borderRadius: 2, padding: 10, marginTop: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div><FL t="Date" /><input style={inp} type="date" value={svcForm.date} onChange={e => setSvcForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div><FL t="Cost ($)" /><input style={inp} type="number" min="0" step="0.01" value={svcForm.cost} onChange={e => setSvcForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" /></div>
                  <div style={{ gridColumn: "1/-1" }}><FL t="Notes *" /><textarea style={{ ...txa, minHeight: 40 }} value={svcForm.notes} onChange={e => setSvcForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Replaced carbon brushes" autoFocus /></div>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setAddSvc(false)} style={{ ...btnG, ...sm }}>Cancel</button>
                  <button onClick={addServiceEntry} disabled={!svcForm.notes.trim()} style={{ ...btnA, ...sm, opacity: svcForm.notes.trim() ? 1 : 0.4 }}>Add Entry</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddSvc(true)} style={{ ...btnG, width: "100%", marginTop: 6, fontSize: 9 }}>+ Log Service / Repair</button>
            ))}
          </div>

          {!isShared && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
              <button onClick={onEdit}   style={{...btnA,width:"100%",padding:"9px 14px"}}>Edit Tool</button>
              <button onClick={onDelete} style={{...btnA,width:"100%",padding:"9px 14px",background:RED}}>Delete</button>
            </div>
          )}
        </div>
      )}

      {photoIdx !== null && (
        <div style={{ position: "fixed", inset: 0, background: "#000d", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setPhotoIdx(null)}>
          <img src={tool.photos[photoIdx]} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 2 }}
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default function ToolsTab({ session, profile, company, onGoToBilling }) {
  const userId = session?.user?.id;
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [formTool, setFormTool] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(null);
  const [showLoaned, setShowLoaned] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('toolsSort') || null);
  const [view, setView] = useState(() => localStorage.getItem('toolsView') || 'list');
  const [cols, setCols] = useState(() => parseInt(localStorage.getItem('toolsCols') || '2'));
  const [tileOpen, setTileOpen] = useState(null);

  const setViewP = v => { setView(v); localStorage.setItem('toolsView', v); };
  const setSortByP = v => { setSortBy(v); v ? localStorage.setItem('toolsSort', v) : localStorage.removeItem('toolsSort'); };
  const setColsP = c => { setCols(c); localStorage.setItem('toolsCols', String(c)); setViewP('grid'); };

  const isFree  = effectiveTier(profile, company) === "free";
  const limit   = assetLimit('tools', profile, company);
  const atLimit = atAssetLimit('tools', tools.length, profile, company);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTools().then(ts => { setTools(ts); setLoading(false); }).catch(() => { setErr("Failed to load tools. Refresh to try again."); setLoading(false); });
  }, [userId]);

  const totalValue  = useMemo(() => tools.reduce((s, t) => s + (t.purchasePrice || 0), 0), [tools]);
  const loanedCount = useMemo(() => tools.filter(t => t.loanedTo).length, [tools]);

  const activeCats = useMemo(() => {
    const seen = new Set(tools.map(t => t.category).filter(Boolean));
    return TOOL_CATEGORIES.filter(c => seen.has(c));
  }, [tools]);

  const filtered = useMemo(() => {
    let r = tools;
    if (showLoaned) r = r.filter(t => t.loanedTo);
    if (catFilter) r = r.filter(t => t.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(t =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.brand || "").toLowerCase().includes(q) ||
        (t.model || "").toLowerCase().includes(q) ||
        (t.storageLocation || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [tools, search, catFilter, showLoaned]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'condition') { const o = ['New','Good','Fair','Poor']; return o.indexOf(a.condition||'Good') - o.indexOf(b.condition||'Good'); }
      if (sortBy === 'category') return (a.category||'').localeCompare(b.category||'');
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'price_hi') return (b.purchasePrice||0) - (a.purchasePrice||0);
      if (sortBy === 'warranty') {
        const ad = a.warrantyExpiry ? new Date(a.warrantyExpiry).getTime() : Infinity;
        const bd = b.warrantyExpiry ? new Date(b.warrantyExpiry).getTime() : Infinity;
        return ad - bd;
      }
      return 0;
    });
  }, [filtered, sortBy]);

  const save = async (tool) => {
    const saved = await saveToolItem(tool);
    setTools(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev];
    });
    setFormTool(null);
  };

  const update = async (tool) => {
    const saved = await saveToolItem(tool);
    setTools(prev => prev.map(t => t.id === saved.id ? saved : t));
  };

  const remove = async (toolId) => {
    if (!confirm("Delete this tool?")) return;
    await deleteToolItem(toolId);
    setTools(prev => prev.filter(t => t.id !== toolId));
  };

  return (
    <div style={{ padding: 16, flex: 1 }}>
      {atLimit && <UpgradeBanner text={`You're at the ${limit}-tool limit on the free plan.`} onUpgrade={onGoToBilling} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TXT, letterSpacing: '0.06em' }}>🔧 Tools</div>
          <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>
            {tools.length} tool{tools.length !== 1 ? 's' : ''}
            {isFree && <span style={{ marginLeft: 8, color: atLimit ? RED : MUT }}>· {tools.length}/{limit} (free limit)</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={{ ...btnG, color: sortBy ? ACC : MUT, alignSelf: 'stretch' }} onClick={() => setShowSort(true)} title="Sort">⚙️</button>
          <button onClick={() => { if (view === 'list') { setColsP(2); } else if (cols < 4) { setColsP(cols + 1); } else { setViewP('list'); } }} style={{ ...btnG, minWidth: 36, alignSelf: 'stretch' }}>{view === 'list' ? '☰' : `⊞${cols}`}</button>
          <button
            onClick={() => setFormTool({})}
            disabled={atLimit}
            style={{ ...btnA, opacity: atLimit ? 0.4 : 1, minHeight: 44, display: 'flex', alignItems: 'center' }}
            title={atLimit ? `Upgrade to add more than ${limit} tools` : undefined}
          >
            + Add Tool
          </button>
        </div>
      </div>

      {tools.length > 0 && (
        <div style={{ display: "flex", gap: 20, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1a1a1a" }}>
          {[
            { label: "Total value", value: fmtMoney(totalValue), col: GRN, show: totalValue > 0 },
            { label: "Loaned out",  value: loanedCount,          col: ACC, show: loanedCount > 0 },
          ].filter(s => s.show).map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 7, color: MUT, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.col, fontFamily: "'IBM Plex Mono',monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {tools.length > 0 && (
        <input style={{ ...inp, marginBottom: 8, fontSize: 11 }} placeholder="Search tools…" value={search} onChange={e => setSearch(e.target.value)} />
      )}

      {(activeCats.length > 0 || loanedCount > 0) && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {activeCats.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter === c ? null : c)}
              style={{ fontSize: 8, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", border: "1px solid " + ACC + "55", background: catFilter === c ? ACC + "22" : "transparent", color: catFilter === c ? ACC : MUT }}>
              {c}
            </button>
          ))}
          {loanedCount > 0 && (
            <button onClick={() => setShowLoaned(x => !x)}
              style={{ fontSize: 8, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", border: "1px solid " + ACC + "55", background: showLoaned ? ACC + "22" : "transparent", color: showLoaned ? ACC : MUT }}>
              Loaned Out ({loanedCount})
            </button>
          )}
        </div>
      )}

      {err && <div style={{ fontSize: 10, color: RED, padding: "12px 0", textAlign: "center" }}>{err}</div>}
      {loading && <div style={{ fontSize: 10, color: MUT, padding: "24px 0", textAlign: "center" }}>Loading…</div>}

      {!loading && tools.length === 0 && (
        <Empty icon="🔧" t="No tools yet" sub="Add your first tool — power tools, hand tools, specialty gear, anything in your workshop." />
      )}
      {!loading && tools.length > 0 && sorted.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No tools match your filter.</div>
      )}

      {view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {sorted.map(tool => (
              <AssetTile
                key={tool.id}
                photo={tool.photos?.[0]}
                icon="🔧"
                accentColor={COND_COL[tool.condition] || MUT}
                name={tool.name}
                sub={[tool.brand, tool.model].filter(Boolean).join(' ') || tool.category}
                badges={[
                  tool.condition && { l: tool.condition, c: COND_COL[tool.condition] || MUT },
                  tool.loanedTo && { l: 'Loaned', c: ACC },
                ].filter(Boolean)}
                onClick={() => setTileOpen(tool.id)}
              />
            ))}
          </div>
          {tileOpen && (() => {
            const tool = sorted.find(x => x.id === tileOpen);
            return tool ? (
              <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200, overflowY: 'auto' }}
                onClick={e => { if (e.target === e.currentTarget) setTileOpen(null); }}>
                <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 8px' }}>
                  <ToolCard
                    tool={tool}
                    isShared={tool.userId !== userId}
                    onEdit={() => { setFormTool(tool); setTileOpen(null); }}
                    onDelete={() => { remove(tool.id); setTileOpen(null); }}
                    onUpdate={update}
                  />
                  <button onClick={() => setTileOpen(null)} style={{ ...btnG, width: '100%', marginTop: 8, fontSize: 10 }}>Close</button>
                </div>
              </div>
            ) : null;
          })()}
        </>
      ) : (
        sorted.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isShared={tool.userId !== userId}
            onEdit={() => setFormTool(tool)}
            onDelete={() => remove(tool.id)}
            onUpdate={update}
          />
        ))
      )}

      {showSort && (
        <div style={ovly} onClick={() => setShowSort(false)}>
          <div style={{ ...mdl, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
            <div style={mdlH}>
              <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort Tools</b>
              <button style={{ ...btnG, ...sm }} onClick={() => setShowSort(false)}>✕</button>
            </div>
            <div style={{ ...mdlB, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(null)}>
                <input type="radio" readOnly checked={sortBy === null} style={{ accentColor: ACC, width: 15, height: 15 }} />
                <span style={{ fontSize: 11, color: sortBy === null ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>Default order</span>
              </label>
              {TOOL_SORT_OPTS.map(o => (
                <label key={o.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setSortByP(o.k)}>
                  <input type="radio" readOnly checked={sortBy === o.k} style={{ accentColor: ACC, width: 15, height: 15 }} />
                  <span style={{ fontSize: 11, color: sortBy === o.k ? TXT : MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={mdlF}>
              <button style={btnG} onClick={() => { setSortByP(null); setShowSort(false); }}>Reset</button>
              <button style={btnA} onClick={() => setShowSort(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {formTool !== null && (
        <ToolForm
          tool={formTool?.id ? formTool : null}
          onSave={save}
          onCancel={() => setFormTool(null)}
        />
      )}
    </div>
  );
}
