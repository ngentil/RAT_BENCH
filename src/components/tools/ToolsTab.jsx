import React, { useState, useMemo, useEffect } from 'react';
import { ACC, MUT, BRD, TXT, GRN, RED, SURF, inp, sel, txa, btnA, btnG, btnD, sm, ovly, mdl, mdlH, mdlB, mdlF } from '../../lib/styles';
import { SL, FL, Empty } from '../ui/shared';
import PhotoAdder from '../ui/PhotoAdder';
import { effectiveTier } from '../../lib/gates';
import { getTools, saveToolItem, deleteToolItem } from '../../lib/db/tools';

const ORANGE = '#e8870a';

const TOOL_CATEGORIES = [
  "Power Tools", "Hand Tools", "Measuring & Diagnostic",
  "Specialty", "Lifting & Safety", "Other",
];
const TOOL_CONDITIONS = ["New", "Good", "Fair", "Poor"];
const COND_COL = { New: "#3d9e50", Good: "#3a7bd5", Fair: "#e8870a", Poor: "#c94040" };

function fmtDate(s) {
  if (!s) return null;
  return new Date(s).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtMoney(n) {
  return "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
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
    name: tool.name || "",
    brand: tool.brand || "",
    model: tool.model || "",
    category: tool.category || "",
    condition: tool.condition || "Good",
    purchaseDate: tool.purchaseDate || "",
    purchasePrice: tool.purchasePrice ? String(tool.purchasePrice) : "",
    warrantyExpiry: tool.warrantyExpiry || "",
    storageLocation: tool.storageLocation || "",
    notes: tool.notes || "",
    photos: tool.photos || [],
  } : EMPTY_FORM);

  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const save = () => {
    if (!f.name.trim()) return;
    onSave({
      ...tool,
      ...f,
      name: f.name.trim(),
      brand: f.brand.trim(),
      model: f.model.trim(),
      purchasePrice: parseFloat(f.purchasePrice) || 0,
    });
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
          <div>
            <FL t="Brand" />
            <input style={inp} value={f.brand} onChange={e => s("brand", e.target.value)} placeholder="e.g. Makita" />
          </div>
          <div>
            <FL t="Model" />
            <input style={inp} value={f.model} onChange={e => s("model", e.target.value)} placeholder="e.g. GA5030" />
          </div>
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
          <div>
            <FL t="Purchase date" />
            <input style={inp} type="date" value={f.purchaseDate} onChange={e => s("purchaseDate", e.target.value)} />
          </div>
          <div>
            <FL t="Purchase price ($)" />
            <input style={inp} type="number" min="0" step="0.01" value={f.purchasePrice} onChange={e => s("purchasePrice", e.target.value)} placeholder="0.00" />
          </div>
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
            <textarea style={{ ...txa, minHeight: 50 }} value={f.notes} onChange={e => s("notes", e.target.value)} placeholder="e.g. 115mm disc, 11,000 RPM, bought from bunnings" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <PhotoAdder photos={f.photos} setPhotos={ps => s("photos", typeof ps === "function" ? ps(f.photos) : ps)} label="Photos" />
          </div>
        </div>
        <div style={mdlF}>
          <button style={btnG} onClick={onCancel}>Cancel</button>
          <button style={{ ...btnA, opacity: f.name.trim() ? 1 : 0.4 }} disabled={!f.name.trim()} onClick={save}>
            {isEdit ? "Save Changes" : "Add Tool"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, onEdit, onDelete, onUpdate }) {
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

  const markLoaned = () => {
    if (!loanName.trim()) return;
    onUpdate({ ...tool, loanedTo: loanName.trim(), loanedAt: new Date().toISOString() });
    setLoanForm(false);
    setLoanName("");
  };

  const markReturned = () => onUpdate({ ...tool, loanedTo: null, loanedAt: null });

  const addServiceEntry = () => {
    if (!svcForm.notes.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      date: svcForm.date,
      notes: svcForm.notes.trim(),
      cost: parseFloat(svcForm.cost) || 0,
    };
    onUpdate({ ...tool, serviceLog: [...(tool.serviceLog || []), entry] });
    setAddSvc(false);
    setSvcForm({ date: new Date().toISOString().slice(0, 10), notes: "", cost: "" });
  };

  const removeSvcEntry = id => {
    if (!confirm("Remove this entry?")) return;
    onUpdate({ ...tool, serviceLog: (tool.serviceLog || []).filter(e => e.id !== id) });
  };

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid " + (isLoaned ? ORANGE + "55" : "#252525"), borderRadius: 2, marginBottom: 6 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{tool.name}</span>
            {tool.condition && (
              <span style={{ fontSize: 7, color: condColor, border: "1px solid " + condColor + "44", borderRadius: 2, padding: "1px 4px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                {tool.condition}
              </span>
            )}
            {isLoaned && (
              <span style={{ fontSize: 7, color: ORANGE, border: "1px solid " + ORANGE + "55", borderRadius: 2, padding: "1px 4px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                LOANED → {tool.loanedTo}
              </span>
            )}
            {warrantyWarn && !warrantyExpired && (
              <span style={{ fontSize: 7, color: ORANGE, letterSpacing: "0.06em" }}>⚠ warranty {warrantyDays}d left</span>
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
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid #1a1a1a" }}>
          {tool.photos?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginTop: 10 }}>
              {tool.photos.map((p, i) => (
                <img key={i} src={p} alt="" onClick={() => setPhotoIdx(i)}
                  style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 2, border: "1px solid #252525", cursor: "pointer" }} />
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
                <div style={{ fontSize: 10, color: warrantyExpired ? RED : warrantyWarn ? ORANGE : TXT }}>
                  {fmtDate(tool.warrantyExpiry)}
                  {warrantyDays !== null && !warrantyExpired && (
                    <span style={{ marginLeft: 5, fontSize: 8, color: warrantyWarn ? ORANGE : MUT }}>({warrantyDays}d left)</span>
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
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Loaned Out</div>
            {isLoaned ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: ORANGE }}>
                  Loaned to <b>{tool.loanedTo}</b>
                  {tool.loanedAt && <span style={{ color: MUT, fontSize: 8, marginLeft: 6 }}>since {fmtDate(tool.loanedAt)}</span>}
                </span>
                <button onClick={markReturned} style={{ ...btnA, ...sm, background: GRN, borderColor: GRN, color: "#000" }}>Mark Returned</button>
              </div>
            ) : loanForm ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Who's borrowing it?"
                  value={loanName}
                  onChange={e => setLoanName(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && markLoaned()}
                />
                <button onClick={markLoaned} style={{ ...btnA, ...sm }}>Save</button>
                <button onClick={() => { setLoanForm(false); setLoanName(""); }} style={{ ...btnG, ...sm }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setLoanForm(true)} style={{ ...btnG, ...sm }}>Mark as Loaned</button>
            )}
          </div>

          {/* Service log */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 7, color: ACC, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
              Service / Repair Log {tool.serviceLog?.length > 0 && `(${tool.serviceLog.length})`}
            </div>
            {(tool.serviceLog || []).map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: MUT }}>{fmtDate(e.date)}</div>
                  <div style={{ fontSize: 10, color: TXT, marginTop: 2, lineHeight: 1.4 }}>{e.notes}</div>
                  {e.cost > 0 && <div style={{ fontSize: 8, color: GRN, marginTop: 2 }}>{fmtMoney(e.cost)}</div>}
                </div>
                <button onClick={() => removeSvcEntry(e.id)} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}
            {addSvc ? (
              <div style={{ background: "#0a0a0a", border: "1px solid " + ACC + "44", borderRadius: 2, padding: 10, marginTop: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div>
                    <FL t="Date" />
                    <input style={inp} type="date" value={svcForm.date} onChange={e => setSvcForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <FL t="Cost ($)" />
                    <input style={inp} type="number" min="0" step="0.01" value={svcForm.cost} onChange={e => setSvcForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <FL t="Notes *" />
                    <textarea style={{ ...txa, minHeight: 40 }} value={svcForm.notes} onChange={e => setSvcForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Replaced carbon brushes" autoFocus />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setAddSvc(false)} style={{ ...btnG, ...sm }}>Cancel</button>
                  <button onClick={addServiceEntry} disabled={!svcForm.notes.trim()} style={{ ...btnA, ...sm, opacity: svcForm.notes.trim() ? 1 : 0.4 }}>Add Entry</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddSvc(true)} style={{ ...btnG, width: "100%", marginTop: 6, fontSize: 9 }}>+ Log Service / Repair</button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <button onClick={onEdit} style={{ ...btnG, ...sm }}>Edit</button>
            <button onClick={onDelete} style={{ ...btnD, ...sm }}>Delete</button>
          </div>
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

  useEffect(() => { getTools(userId).then(setTools); }, [userId]);
  const [formTool, setFormTool] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(null);
  const [showLoaned, setShowLoaned] = useState(false);

  const isFree = effectiveTier(profile, company) === "free";

  const totalValue = useMemo(() => tools.reduce((s, t) => s + (t.purchasePrice || 0), 0), [tools]);
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

  if (isFree) {
    return (
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>🔧</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: TXT }}>Tool Inventory</div>
        <div style={{ fontSize: 10, color: MUT, maxWidth: 280, lineHeight: 1.7 }}>
          Track your personal tool collection — brand, condition, warranty, storage location, service history, and who you've loaned tools to. Enthusiast and above.
        </div>
        {onGoToBilling && <button onClick={onGoToBilling} style={{ ...btnA, ...sm }}>View Plans</button>}
      </div>
    );
  }

  const save = async (tool) => {
    setTools(await saveToolItem(userId, tool));
    setFormTool(null);
  };

  const update = async (tool) => setTools(await saveToolItem(userId, tool));

  const remove = async (toolId) => {
    if (!confirm("Delete this tool?")) return;
    setTools(await deleteToolItem(userId, toolId));
  };

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SL t="Tools" />
          <span style={{ fontSize: 8, color: MUT, letterSpacing: "0.06em" }}>{tools.length} tool{tools.length !== 1 ? "s" : ""}</span>
          {totalValue > 0 && <span style={{ fontSize: 8, color: GRN, letterSpacing: "0.06em" }}>{fmtMoney(totalValue)}</span>}
          {loanedCount > 0 && <span style={{ fontSize: 8, color: ORANGE, letterSpacing: "0.06em" }}>{loanedCount} loaned out</span>}
        </div>
        <button onClick={() => setFormTool({})} style={{ ...btnA, ...sm }}>+ Add Tool</button>
      </div>

      {tools.length > 4 && (
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
              style={{ fontSize: 8, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", border: "1px solid " + ORANGE + "55", background: showLoaned ? ORANGE + "22" : "transparent", color: showLoaned ? ORANGE : MUT }}>
              Loaned Out ({loanedCount})
            </button>
          )}
        </div>
      )}

      {tools.length === 0 && (
        <Empty icon="🔧" t="No tools yet" sub="Add your first tool — power tools, hand tools, specialty gear, anything in your workshop." />
      )}
      {tools.length > 0 && filtered.length === 0 && (
        <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No tools match your filter.</div>
      )}

      {filtered.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onEdit={() => setFormTool(tool)}
          onDelete={() => remove(tool.id)}
          onUpdate={update}
        />
      ))}

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
