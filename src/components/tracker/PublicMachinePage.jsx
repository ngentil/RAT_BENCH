import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { mIcon } from '../../lib/helpers';

const BG   = "#0a0a0a";
const SURF = "#111111";
const BRD  = "#2a2a2a";
const TXT  = "#e8e8e8";
const MUT  = "#555555";
const GRN  = "#4ade80";
const ACC  = "#00ff88";

export default function PublicMachinePage({ machineId }) {
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.rpc('get_public_machine', { p_id: machineId }).then(({ data, error }) => {
      if (error || !data) { setNotFound(true); }
      else { setMachine(data); }
      setLoading(false);
    });
  }, [machineId]);

  const mono = { fontFamily: "'IBM Plex Mono', monospace" };

  if (loading) return (
    <div style={{ ...mono, minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: MUT, fontSize: 11 }}>
      Loading…
    </div>
  );

  if (notFound) return (
    <div style={{ ...mono, minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
      <div style={{ fontSize: 32 }}>⚙️</div>
      <div style={{ fontSize: 13, color: TXT, fontWeight: 700 }}>Machine not found</div>
      <div style={{ fontSize: 10, color: MUT }}>This link may be expired or the machine was removed.</div>
      <a href="/" style={{ fontSize: 10, color: ACC, textDecoration: "none", marginTop: 8 }}>← Back to RAT BENCH</a>
    </div>
  );

  const totalHrs = ((machine.time_log || []).reduce((s, e) => s + (e.seconds || 0), 0) / 3600).toFixed(1);
  const lastSvc = machine.last_service_date ? new Date(machine.last_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div style={{ ...mono, minHeight: "100vh", background: BG, color: TXT }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ fontSize: 8, color: MUT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>RAT BENCH</div>

        <div style={{ background: SURF, border: "1px solid " + BRD, borderRadius: 2, padding: "20px 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 36 }}>{mIcon(machine.type)}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TXT, lineHeight: 1.2 }}>{machine.name}</div>
              <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>
                {[machine.make, machine.model, machine.year].filter(Boolean).join(" · ")}
              </div>
              {machine.type && <div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>{machine.type}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {parseFloat(totalHrs) > 0 && (
              <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 2, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Total Hours</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: GRN }}>{totalHrs}h</div>
              </div>
            )}
            {lastSvc && (
              <div style={{ background: "#0a0a1a", border: "1px solid #1a1a3a", borderRadius: 2, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Last Service</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{lastSvc}</div>
              </div>
            )}
          </div>

          {machine.notes && (
            <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7, borderTop: "1px solid " + BRD, paddingTop: 14, marginBottom: 16 }}>
              {machine.notes}
            </div>
          )}

          <div style={{ borderTop: "1px solid " + BRD, paddingTop: 16 }}>
            <div style={{ fontSize: 9, color: MUT, marginBottom: 8 }}>Track your own machines, service history and jobs.</div>
            <a href="/" style={{ display: "inline-block", background: ACC, color: "#000", fontSize: 10, fontWeight: 700, padding: "8px 16px", borderRadius: 2, textDecoration: "none", letterSpacing: "0.05em" }}>
              Track yours on RAT BENCH →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
