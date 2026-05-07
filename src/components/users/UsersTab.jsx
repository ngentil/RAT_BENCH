import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, GRN, RED, btnA, btnG, sm } from '../../lib/styles';
import { getCompanyMembers, removeMember, regenerateInviteCode, updateMemberRole } from '../../lib/db';
import { SL } from '../ui/shared';

const ROLES = ["admin", "technician", "viewer"];

const ROLE_COLOR = {
  admin:      ACC,
  technician: "#4a9eff",
  viewer:     MUT,
};

function Avatar({ name }) {
  const letter = (name || "?")[0].toUpperCase();
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a",
      border: "1px solid #333", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 12, fontWeight: 700,
      color: ACC, flexShrink: 0, fontFamily: "'IBM Plex Mono',monospace",
    }}>
      {letter}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "2px 6px", borderRadius: 2, fontFamily: "'IBM Plex Mono',monospace",
      color: ROLE_COLOR[role] || MUT,
      border: `1px solid ${ROLE_COLOR[role] || MUT}55`,
      background: `${ROLE_COLOR[role] || MUT}11`,
    }}>
      {role}
    </span>
  );
}

export default function UsersTab({ company, session, profile, setCompany, onGoToBilling }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [updatingRole, setUpdatingRole] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = company?.owner_id === session?.user?.id;

  useEffect(() => {
    if (!company) return;
    getCompanyMembers(company.id)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [company?.id]);

  if (!company) {
    return (
      <div style={{ padding: 16 }}>
        <SL t="Users" />
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.7 }}>
          You're not part of an organisation yet. Create or join one in Settings → Company.
        </div>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(company.invite_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegen = async () => {
    if (!confirm("Regenerate invite code? The old one will stop working.")) return;
    try {
      const updated = await regenerateInviteCode(company.id);
      setCompany(updated);
    } catch (e) { setErr(e.message); }
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`Remove ${name} from the organisation?`)) return;
    try {
      await removeMember(company.id, userId);
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (e) { setErr(e.message); }
  };

  const handleRoleChange = async (userId, role) => {
    setUpdatingRole(userId);
    setErr("");
    try {
      await updateMemberRole(company.id, userId, role);
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role } : m));
    } catch (e) { setErr(e.message); }
    setUpdatingRole(null);
  };

  const sec = { marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid " + BRD };
  const lbl = { fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 };

  return (
    <div style={{ padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SL t="Users" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, color: MUT, letterSpacing: "0.06em" }}>
            {loading ? "…" : `${members.length} member${members.length !== 1 ? "s" : ""}`}
          </span>
          {isOwner && (
            <button onClick={() => setShowInvite(x => !x)} style={{ ...btnA, ...sm }}>
              {showInvite ? "✕ Close" : "+ Invite Member"}
            </button>
          )}
        </div>
      </div>

      {err && <div style={{ fontSize: 10, color: RED, marginBottom: 12 }}>{err}</div>}

      {/* Invite panel */}
      {isOwner && showInvite && (
        <div style={{ background: "#0a0f0a", border: "1px solid " + ACC + "44", borderRadius: 2, padding: "14px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: ACC, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
            Invite Member
          </div>
          <div style={{ fontSize: 10, color: MUT, marginBottom: 12, lineHeight: 1.7 }}>
            Share this code with your team member. They enter it in{" "}
            <span style={{ color: TXT }}>Settings → Company → Join with Code</span>.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              fontSize: 22, fontWeight: 700, letterSpacing: "0.25em", color: TXT,
              fontFamily: "'IBM Plex Mono',monospace", background: "#111",
              border: "1px solid #444", borderRadius: 2, padding: "8px 14px", flex: 1, textAlign: "center",
            }}>
              {company.invite_code || "—"}
            </div>
            <button onClick={copyCode} style={{ ...btnA, ...sm, minWidth: 72 }}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <button onClick={handleRegen} style={{ ...btnG, ...sm, fontSize: 8, color: MUT }}>
            Regenerate code
          </button>
          <div style={{ fontSize: 8, color: MUT, marginTop: 6, lineHeight: 1.6 }}>
            Regenerating invalidates the old code immediately.
          </div>
        </div>
      )}

      {/* Members list */}
      <div>
        <div style={lbl}>Members</div>
        {loading && <div style={{ fontSize: 10, color: MUT }}>Loading…</div>}
        {!loading && members.map(m => {
          const displayName = m.profile?.display_name || m.profile?.username || m.user_id.slice(0, 8);
          const isMe = m.user_id === session?.user?.id;
          const isMemberOwner = m.user_id === company.owner_id;

          return (
            <div key={m.user_id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid " + BRD,
            }}>
              <Avatar name={displayName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{displayName}</span>
                  {isMe && <span style={{ fontSize: 8, color: MUT, letterSpacing: "0.08em" }}>you</span>}
                </div>
                <div style={{ fontSize: 9, color: MUT }}>@{m.profile?.username || "—"}</div>
              </div>

              {/* Role */}
              {isMemberOwner ? (
                <RoleBadge role="owner" />
              ) : isOwner ? (
                <select
                  value={m.role || "viewer"}
                  disabled={updatingRole === m.user_id}
                  onChange={e => handleRoleChange(m.user_id, e.target.value)}
                  style={{
                    background: "#0d0d0d", border: "1px solid #333", borderRadius: 2,
                    color: ROLE_COLOR[m.role] || MUT, fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    fontFamily: "'IBM Plex Mono',monospace", padding: "3px 6px",
                    cursor: "pointer", opacity: updatingRole === m.user_id ? 0.5 : 1,
                  }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <RoleBadge role={m.role || "viewer"} />
              )}

              {/* Remove */}
              {isOwner && !isMemberOwner && !isMe && (
                <button
                  onClick={() => handleRemove(m.user_id, displayName)}
                  style={{ ...btnG, ...sm, color: RED, border: "1px solid " + RED + "55", fontSize: 8 }}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, fontSize: 9, color: MUT, lineHeight: 1.7 }}>
        Roles: <span style={{ color: ROLE_COLOR.admin }}>Admin</span> — full access ·{" "}
        <span style={{ color: ROLE_COLOR.technician }}>Technician</span> — can edit machines ·{" "}
        <span style={{ color: ROLE_COLOR.viewer }}>Viewer</span> — read only
      </div>
    </div>
  );
}
