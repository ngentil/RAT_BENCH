import React from 'react';
import { BG, SURF, BRD, TXT, MUT, ACC, btnG, sm } from '../../lib/styles';

const H = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: ACC, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>{children}</div>
);
const P = ({ children }) => (
  <div style={{ fontSize: 10, color: MUT, lineHeight: 1.8, marginBottom: 8 }}>{children}</div>
);

export default function TermsPage({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 9999, overflowY: 'auto', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ACC, letterSpacing: '0.06em', textTransform: 'uppercase' }}>🐀 RAT BENCH</div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>Terms of Service</div>
          </div>
          {onClose && <button onClick={onClose} style={{ ...btnG, ...sm }}>← Back</button>}
        </div>

        <P>Last updated: January 2025</P>
        <P>These Terms of Service ("Terms") govern your use of RAT BENCH ("the Service"), operated by RAT BENCH ("we", "us", "our"). By creating an account or using the Service, you agree to these Terms.</P>

        <H>1. The Service</H>
        <P>RAT BENCH is a workshop management tool for tracking machines, jobs, parts, and revenue. The Service is provided on a subscription basis with free and paid tiers.</P>

        <H>2. Eligibility</H>
        <P>You must be at least 18 years old to use the Service. By using the Service, you represent that you meet this requirement.</P>

        <H>3. Accounts</H>
        <P>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access. We are not liable for loss resulting from unauthorised use of your account.</P>

        <H>4. Acceptable Use</H>
        <P>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Service; (c) reverse engineer or attempt to extract the source code; (d) use the Service to store or transmit malicious code; (e) resell or sublicense access to the Service.</P>

        <H>5. Subscriptions and Billing</H>
        <P>Paid plans are billed in advance on a monthly or annual basis. Payments are processed securely by Stripe. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are not provided for partial periods.</P>
        <P>We reserve the right to change pricing with 30 days' notice. Continued use after a price change constitutes acceptance of the new pricing.</P>

        <H>6. Data and Content</H>
        <P>You retain ownership of all data you input into the Service. You grant us a limited licence to store and process your data solely to provide the Service. We do not sell your data to third parties.</P>
        <P>You are responsible for ensuring the accuracy of data you enter and for maintaining your own backups of critical business records.</P>

        <H>7. Service Availability</H>
        <P>We aim for high availability but do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind, express or implied. Planned maintenance will be communicated where practical.</P>

        <H>8. Limitation of Liability</H>
        <P>To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or loss-of-profit damages arising from your use of or inability to use the Service, even if advised of the possibility of such damages.</P>
        <P>Our total liability to you for any claim arising from these Terms or the Service shall not exceed the amount you paid us in the 3 months preceding the claim.</P>

        <H>9. Termination</H>
        <P>You may cancel your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days after termination before deletion.</P>

        <H>10. Governing Law</H>
        <P>These Terms are governed by the laws of Victoria, Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of Victoria.</P>

        <H>11. Changes to These Terms</H>
        <P>We may update these Terms from time to time. We will notify you of material changes via the Service or email. Continued use after changes constitutes acceptance.</P>

        <H>12. Contact</H>
        <P>For questions about these Terms, contact us through the app or at the email address associated with your account.</P>

        {onClose && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button onClick={onClose} style={{ ...btnG }}>← Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}
