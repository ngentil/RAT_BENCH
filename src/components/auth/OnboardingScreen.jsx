import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ACC, MUT, BRD, SURF, BG, GRN, RED, TXT, inp, btnA, btnG, sm } from '../../lib/styles';
import { RESERVED_USERNAMES } from '../../lib/constants';
import { checkUsernameAvailable, generateAvailableUsername } from '../../lib/username';

function OnboardingScreen({ session, onComplete }) {
  const [username,    setUsername]    = useState(session?.user?.user_metadata?.username || '');
  const [availability, setAvailability] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [generating,  setGenerating]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const debounceRef = useRef(0);

  useEffect(() => {
    const name = username.trim();
    if (!name || name.length < 3 || !/^[a-z0-9_]+$/.test(name)) {
      setAvailability(null);
      return;
    }
    setAvailability('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const ok = await checkUsernameAvailable(name);
      setAvailability(ok ? 'available' : 'taken');
    }, 450);
  }, [username]);

  const handleGenerate = async () => {
    setGenerating(true); setError('');
    const name = await generateAvailableUsername();
    setUsername(name);
    setAvailability('available');
    setGenerating(false);
  };

  const save = async () => {
    const name = username.trim().toLowerCase();
    if (!name)                                           { setError('Username is required.'); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(name))                { setError('3–20 characters, letters/numbers/underscores only.'); return; }
    if (RESERVED_USERNAMES.has(name))                    { setError('That username is reserved — please choose another.'); return; }
    if (availability === 'taken')                        { setError('That username is already taken.'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.from('profiles').upsert({
      id:           session.user.id,
      username:     name,
      account_type: 'personal',
    }, { onConflict: 'id' });
    if (error) {
      if (error.code === '23505') setError('That username is already taken — try another.');
      else setError(error.message);
      setLoading(false);
    } else {
      onComplete({ username: name, accountType: 'personal' });
    }
  };

  const avIcon = availability === 'checking'  ? <span style={{ color: MUT }}>…</span>
               : availability === 'available' ? <span style={{ color: GRN }}>✓</span>
               : availability === 'taken'     ? <span style={{ color: RED }}>✗</span>
               : null;

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🐀</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: ACC, letterSpacing: '0.06em', textTransform: 'uppercase' }}>One last thing</div>
          <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>Pick a username to get started.</div>
        </div>
        <div style={{ background: SURF, border: '1px solid ' + BRD, borderTop: '2px solid ' + ACC, borderRadius: 2, padding: 20 }}>
          <div style={{ fontSize: 8, color: MUT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Username *</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                style={{ ...inp, paddingRight: 28, width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. wrench_rat"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && save()}
                maxLength={20}
                autoFocus
              />
              {avIcon && (
                <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, pointerEvents: 'none' }}>
                  {avIcon}
                </span>
              )}
            </div>
            <button onClick={handleGenerate} disabled={generating}
              style={{ ...btnG, ...sm, fontSize: 14, padding: '6px 10px', opacity: generating ? 0.5 : 1 }}
              title="Generate random username">
              🎲
            </button>
          </div>
          <div style={{ fontSize: 8, color: MUT, marginBottom: 16 }}>3–20 chars · letters, numbers, underscores</div>
          {error && (
            <div style={{ background: RED + '12', border: '1px solid ' + RED + '44', color: RED, fontSize: 10, padding: '8px 12px', borderRadius: 2, marginBottom: 12, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          <button onClick={save} disabled={loading || availability === 'taken'}
            style={{ ...btnA, width: '100%', padding: '11px 0', fontSize: 10, letterSpacing: '0.1em', opacity: (loading || availability === 'taken') ? 0.5 : 1 }}>
            {loading ? 'Saving...' : "Let's Go →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;
