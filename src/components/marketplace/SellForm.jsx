import React, { useState } from 'react';
import { ACC, MUT, BRD, TXT, RED, btnA, btnG, inp, txa, col, dvdr } from '../../lib/styles';
import { createListing } from '../../lib/marketplace';
import MachineTile from '../machine/MachineTile';

function SellForm({ machines, profile, onCreated, onCancel }) {
  const [machine, setMachine] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const pickMachine = (m) => {
    setMachine(m);
    setTitle(m.name || [m.make, m.model].filter(Boolean).join(" ") || "");
  };

  const submit = async () => {
    if (!title.trim()) { setError("Give the listing a title."); return; }
    setSaving(true); setError(null);
    try {
      const listing = await createListing(machine, {
        title: title.trim(),
        description: description.trim() || null,
        price: price === "" ? null : Number(price),
        location: location.trim() || null,
      }, profile.id);
      onCreated(listing);
    } catch (e) {
      setError(e.message || "Couldn't create the listing.");
    } finally {
      setSaving(false);
    }
  };

  if (!machine) {
    return (
      <div>
        <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>Which machine from your Tracker are you selling?</div>
        {machines.length === 0
          ? <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "24px 0" }}>No machines in your Tracker yet.</div>
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, alignItems: "start", marginBottom: 12 }}>
              {machines.map(m => <MachineTile key={m.id} machine={m} onClick={() => pickMachine(m)} />)}
            </div>
          )}
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>
        Listing <span style={{ color: TXT }}>{machine.name || [machine.make, machine.model].filter(Boolean).join(" ")}</span>{" "}
        <span onClick={() => setMachine(null)} style={{ color: ACC, cursor: "pointer" }}>change</span>
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inp} maxLength={120} />
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Price ($, optional)</label>
        <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} style={inp} inputMode="decimal" placeholder="e.g. 250" />
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Location (optional)</label>
        <input value={location} onChange={e => setLocation(e.target.value)} style={inp} placeholder="e.g. Brisbane, QLD" maxLength={80} />
      </div>

      <div style={col}>
        <label style={{ fontSize: 9, color: MUT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={txa} maxLength={4000} placeholder="Condition, known issues, what's included…" />
      </div>

      {error && <div style={{ fontSize: 10, color: RED, marginBottom: 10 }}>{error}</div>}

      <div style={dvdr} />
      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={saving} onClick={submit} style={btnA}>{saving ? "Publishing…" : "Publish Listing"}</button>
        <button onClick={onCancel} style={btnG}>Cancel</button>
      </div>
    </div>
  );
}

export default SellForm;
