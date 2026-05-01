import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, GRN, RED, inp, btnA, btnG, sm, col, ovly, mdl, mdlH, mdlB } from '../../lib/styles';
import { publishToWiki, saveWikiRevision } from '../../lib/wiki';

function PublishWikiModal({ machine, profile, onClose, onPublished }) {
  const [step, setStep] = useState("loading");
  const [result, setResult] = useState(null);
  const [mergedData, setMergedData] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [picks, setPicks] = useState({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [publishedSlug, setPublishedSlug] = useState("");

  useEffect(() => {
    publishToWiki(machine, profile).then(res => {
      setResult(res);
      if (res.isNew) {
        setSummary("Initial publish");
        setStep("confirm");
      } else {
        const wikiData = res.currentRevision?.data || {};
        const mine = res.specData;
        const cflcts = [];
        const auto = { ...wikiData };
        Object.keys(mine).forEach(k => {
          const mv = mine[k], wv = wikiData[k];
          const hasM = mv !== null && mv !== undefined && mv !== "";
          const hasW = wv !== null && wv !== undefined && wv !== "";
          if (hasM && hasW && String(mv) !== String(wv)) cflcts.push({ key: k, wiki: wv, mine: mv });
          else if (hasM && !hasW) auto[k] = mv;
        });
        setConflicts(cflcts);
        setPicks(Object.fromEntries(cflcts.map(c => [c.key, "wiki"])));
        setMergedData(auto);
        setSummary("Merged specs from my machine");
        setStep(cflcts.length ? "merge" : "confirm");
      }
    }).catch(e => { setErr(e.message); setStep("error"); });
  }, []);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const finalData = { ...mergedData };
      conflicts.forEach(c => { finalData[c.key] = picks[c.key] === "mine" ? c.mine : c.wiki; });
      if (!result.isNew) {
        await saveWikiRevision(
          result.entry.id,
          { ...result.currentRevision?.data, ...finalData },
          summary,
          profile,
        );
      }
      await supabase.from("wiki_contributions").insert({
        entry_id: result.entry.id, machine_id: machine.id, user_id: profile.id,
      });
      setPublishedSlug(result.slug);
      setStep("done");
      onPublished && onPublished(result.slug);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const lbl = { fontSize: 9, color: MUT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 };

  return (
    <div style={ovly} onClick={onClose}>
      <div style={{ ...mdl, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={mdlH}>
          <b style={{ fontSize: 13, textTransform: "uppercase" }}>Publish to Wiki</b>
          <button style={{ ...btnG, ...sm }} onClick={onClose}>✕</button>
        </div>
        <div style={mdlB}>
          {step === "loading" && <div style={{ textAlign: "center", padding: 24, color: MUT, fontSize: 11 }}>Checking wiki…</div>}

          {step === "error" && <>
            <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>
            <button onClick={onClose} style={{ ...btnG, ...sm }}>Close</button>
          </>}

          {step === "done" && <>
            <div style={{ fontSize: 13, color: GRN, marginBottom: 8 }}>✓ Published!</div>
            <div style={{ fontSize: 10, color: MUT, marginBottom: 16 }}>Your data is now live on the wiki.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`https://wiki.ratbench.net/${publishedSlug}`} target="_blank" rel="noreferrer"
                style={{ ...btnA, display: "inline-block", textDecoration: "none", fontSize: 10, padding: "8px 14px" }}>
                View on Wiki →
              </a>
              <button onClick={onClose} style={{ ...btnG, ...sm }}>Close</button>
            </div>
          </>}

          {(step === "confirm" || step === "merge") && <>
            {!result?.isNew && <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: 2, padding: "8px 12px", fontSize: 10, color: GRN, marginBottom: 14 }}>
              A wiki entry for <b>{machine.make} {machine.model}</b> already exists. Your data will be merged as a new revision.
            </div>}
            {result?.isNew && <div style={{ fontSize: 10, color: MUT, marginBottom: 14 }}>
              Creating new wiki entry: <span style={{ color: ACC, fontFamily: "monospace" }}>wiki.ratbench.net/{result?.slug}</span>
            </div>}

            {step === "merge" && conflicts.length > 0 && <>
              <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
                Conflicting Fields — pick which value to keep
              </div>
              <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
                {conflicts.map(c => (
                  <div key={c.key} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid " + BRD }}>
                    <div style={{ ...lbl, marginBottom: 6 }}>{c.key}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {[["wiki", "Wiki: " + String(c.wiki)], ["mine", "Mine: " + String(c.mine)]].map(([val, label]) => (
                        <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 2, border: "1px solid " + (picks[c.key] === val ? ACC : BRD), background: picks[c.key] === val ? "#1a1200" : "transparent" }}>
                          <input type="radio" name={c.key} checked={picks[c.key] === val} onChange={() => setPicks(p => ({ ...p, [c.key]: val }))} style={{ accentColor: ACC }} />
                          <span style={{ fontSize: 10, color: picks[c.key] === val ? "#fff" : MUT }}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            <div style={{ ...col, marginBottom: 12 }}>
              <div style={lbl}>Edit Summary</div>
              <input style={inp} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief description of changes" />
            </div>
            {err && <div style={{ fontSize: 10, color: RED, marginBottom: 10 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submit} disabled={busy} style={{ ...btnA, ...sm, opacity: busy ? 0.6 : 1 }}>{busy ? "Publishing…" : "Publish"}</button>
              <button onClick={onClose} style={{ ...btnG, ...sm }}>Cancel</button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

export default PublishWikiModal;
