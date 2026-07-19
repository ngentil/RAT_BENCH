import React from 'react';
import { BG, MUT, ACC, TXT, btnG, sm } from '../../lib/styles';

const H = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: ACC, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>{children}</div>
);
const P = ({ children }) => (
  <div style={{ fontSize: 10, color: MUT, lineHeight: 1.8, marginBottom: 8 }}>{children}</div>
);

export default function DataRetentionPage({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999, overflowY: 'auto', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ACC, letterSpacing: '0.06em', textTransform: 'uppercase' }}>🐀 RAT BENCH</div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>Data Retention Policy</div>
          </div>
          {onClose && <button onClick={onClose} style={{ ...btnG, ...sm }}>← Back</button>}
        </div>

        <P>Last updated: June 2025</P>
        <P>This policy explains what data Rat Bench collects, how long we keep it, and how you can request its deletion. We are based in Victoria, Australia and comply with the Australian Privacy Act 1988 and, where applicable, the GDPR.</P>

        <H>1. Data We Collect</H>
        <P>We collect and store the following data when you use Rat Bench:</P>
        <P>— Account data: email address, username, account type, country (if provided during signup).</P>
        <P>— Workshop data: machines, service records, job timers, parts and inventory, clients, vehicles, equipment, tools, consumables, and any notes or photos you upload.</P>
        <P>— Usage data: timestamps of when records were created or modified. We do not collect analytics, browsing behaviour, or device fingerprints.</P>

        <H>2. How Long We Keep It</H>
        <P>Active accounts: all workshop data is retained for as long as your account is active.</P>
        <P>After account deletion: we retain your data for 30 days in case of accidental deletion, then permanently delete it from our primary database.</P>
        <P>Database backups: Supabase (our database provider) retains automated backups on their own schedule, used for disaster recovery only.</P>
        <P>Anonymous/guest sessions: guest data is retained for 30 days of inactivity, then purged automatically.</P>

        <H>3. Deletion Requests</H>
        <P>You can delete your account and all associated data at any time from within the app under Settings → Account → Delete Account.</P>
        <P>If you cannot access the app, contact us via the email address associated with your account and we will action your request within 30 days.</P>
        <P>Once the 30-day grace period has passed, deletion is permanent and cannot be undone.</P>

        <H>4. Data Portability</H>
        <P>You can export your workshop data (machines, service records, jobs) from within the app at any time before deleting your account. We do not currently offer a full account data export, but will provide one on request.</P>

        <H>5. Third-Party Processors</H>
        <P>Your data passes through the following third-party processors:</P>
        <P>— Supabase (database and authentication hosting) — workshop data stored in AWS infrastructure.</P>
        <P>— Sentry (error tracking) — error reports retained for 90 days by default.</P>
        <P>— Netlify (frontend hosting) — serves the application only; does not have access to your workshop data.</P>

        <H>6. Legal Basis for Processing (GDPR)</H>
        <P>If you are located in the EEA or UK, our legal basis for processing your data is: (a) contract performance — to provide the Service you have signed up for; (b) legitimate interests — to maintain security, prevent fraud, and improve the Service; (c) consent — for any optional features where we ask for it explicitly.</P>

        <H>7. Contact</H>
        <P>For data retention enquiries, deletion requests, or to exercise your rights under applicable privacy law, contact us through the app or at the email address associated with your account.</P>

        {onClose && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button onClick={onClose} style={{ ...btnG }}>← Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}
