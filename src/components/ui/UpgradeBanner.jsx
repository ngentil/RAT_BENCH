import React from 'react';
import { MUT, GRN, btnA, sm } from '../../lib/styles';

export default function UpgradeBanner({ text, label, onUpgrade, marginBottom = 14 }) {
  return (
    <div style={{
      background: "#0a1a0a",
      border: "1px solid #1a3a1a",
      borderRadius: 2,
      padding: "10px 14px",
      marginBottom,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && <div style={{ fontSize: 9, color: GRN, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>{label}</div>}
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.6 }}>{text}</div>
      </div>
      {onUpgrade && (
        <button onClick={onUpgrade} style={{ ...btnA, ...sm, whiteSpace: "nowrap", flexShrink: 0 }}>
          Upgrade →
        </button>
      )}
    </div>
  );
}
