import React from 'react';
import { BG, MUT, ACC, btnG, sm } from '../../lib/styles';

const H = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: ACC, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>{children}</div>
);
const P = ({ children }) => (
  <div style={{ fontSize: 10, color: MUT, lineHeight: 1.8, marginBottom: 8 }}>{children}</div>
);

export default function PrivacyPage({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999, overflowY: 'auto', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ACC, letterSpacing: '0.06em', textTransform: 'uppercase' }}>🐀 RAT BENCH</div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>Privacy Policy</div>
          </div>
          {onClose && <button onClick={onClose} style={{ ...btnG, ...sm }}>← Back</button>}
        </div>

        <P>Last updated: January 2025</P>
        <P>This Privacy Policy describes how RAT BENCH ("we", "us", "our") collects, uses, and protects your information when you use the Service.</P>

        <H>1. Information We Collect</H>
        <P><span style={{ color: '#aaa' }}>Account data:</span> Email address, username, and display name when you register.</P>
        <P><span style={{ color: '#aaa' }}>Profile data:</span> Company name, ABN, hourly rate, and other business details you optionally provide in Settings.</P>
        <P><span style={{ color: '#aaa' }}>Workshop data:</span> Machines, jobs, time logs, parts, clients, vehicles, tools, and equipment records you create.</P>
        <P><span style={{ color: '#aaa' }}>Usage data:</span> Basic analytics on feature usage to help us improve the Service. We do not use third-party analytics trackers.</P>
        <P><span style={{ color: '#aaa' }}>Payment data:</span> Billing is handled entirely by Stripe. We do not store your card details.</P>

        <H>2. How We Use Your Information</H>
        <P>We use your information to: provide and operate the Service; process payments; send essential service communications (e.g. billing, security); and improve the Service based on usage patterns.</P>
        <P>We do not sell, rent, or trade your personal information to third parties.</P>

        <H>3. Data Storage</H>
        <P>Your data is stored in Supabase (a managed PostgreSQL platform) hosted on AWS infrastructure in the Sydney, Australia region. Data is encrypted in transit (TLS) and at rest.</P>

        <H>4. Data Sharing</H>
        <P>We share your data only with: (a) Supabase, for database hosting; (b) Stripe, for payment processing; (c) as required by law or to protect our legal rights.</P>

        <H>5. Data Retention</H>
        <P>We retain your data for as long as your account is active. If you delete your account, we retain your data for 30 days before permanent deletion, in case of accidental deletion.</P>

        <H>6. Your Rights</H>
        <P>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may export your workshop data from within the app.</P>

        <H>7. Cookies</H>
        <P>We use only essential session cookies required for authentication. We do not use advertising or tracking cookies.</P>

        <H>8. Children's Privacy</H>
        <P>The Service is not directed at children under 18. We do not knowingly collect personal information from minors.</P>

        <H>9. Changes to This Policy</H>
        <P>We may update this policy from time to time. Material changes will be communicated via the Service. Continued use after changes constitutes acceptance.</P>

        <H>10. Contact</H>
        <P>For privacy enquiries or data requests, contact us through the app or at the email address associated with your account. We are based in Victoria, Australia.</P>

        {onClose && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button onClick={onClose} style={{ ...btnG }}>← Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}
