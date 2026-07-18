import React from 'react';
import { MUT, BRD, SURF, GRN } from '../../lib/styles';

// Rat Bench dropped its paid Member tier — every feature is free for every
// account now (see the comment in lib/gates.js). Not currently reachable from
// Settings (the Billing tab was removed), kept around in case it's needed
// again later.
function BillingPage() {
  return (
    <div style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + GRN, borderRadius: 2, padding: "18px 16px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: GRN, marginBottom: 6 }}>Rat Bench is free — no subscription required.</div>
      <div style={{ fontSize: 11, color: MUT, lineHeight: 1.7 }}>
        Unlimited machines, the Wiki, the Marketplace, team seats — every feature is available to every account at no cost. There's no paid plan to upgrade to.
      </div>
    </div>
  );
}

export default BillingPage;
