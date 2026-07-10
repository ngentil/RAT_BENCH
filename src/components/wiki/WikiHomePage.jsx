import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, BG } from '../../lib/styles';
import { searchWiki, getWikiStats, getRecentWikiEntries, tokenizeSearch, WIKI_FIELD_LABELS } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';
import { hl } from './wikiSearchHighlight';

// Handed off to the entry page so it can keep highlighting your search term
// after you click through — sessionStorage covers the embedded (in-app) nav
// path, where navigation is a state switch rather than a real page load.
const LAST_QUERY_KEY = 'wikiSearchQuery';

// Already shown elsewhere in the row (make/model/type badge) — skip these
// when looking for which spec field explains a match.
const SKIP_SPEC_KEYS = new Set(['make', 'model', 'type']);
const SNIPPET_MAX = 90; // long free-text fields (e.g. notes) get trimmed to a snippet around the match

// Finds the first spec field whose value contains one of the search tokens,
// so a result row can show WHY it matched (e.g. "Spark Plug: NGK BPMR7A")
// instead of a bare make/model that doesn't explain a spec-only match.
function findSpecMatch(specData, tokens) {
  if (!specData || !tokens.length) return null;
  for (const [key, label] of Object.entries(WIKI_FIELD_LABELS)) {
    if (SKIP_SPEC_KEYS.has(key)) continue;
    const raw = specData[key];
    if (raw == null || raw === '' || raw === false) continue;
    const value = String(raw);
    const lowerValue = value.toLowerCase();
    const hitToken = tokens.find(t => lowerValue.includes(t.toLowerCase()));
    if (!hitToken) continue;
    if (value.length <= SNIPPET_MAX) return { label, value };
    const idx = lowerValue.indexOf(hitToken.toLowerCase());
    const start = Math.max(0, idx - 30);
    const end = Math.min(value.length, idx + hitToken.length + 50);
    const snippet = (start > 0 ? '…' : '') + value.slice(start, end) + (end < value.length ? '…' : '');
    return { label, value: snippet };
  }
  return null;
}

function WikiHomePage({ onSelect, embedded = false, profile, onShowLeaderboard }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);        // most-viewed default list
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [stats, setStats] = useState(null);
  const [searching, setSearching] = useState(false);

  const reqSeq = React.useRef(0);

  // Load the default discovery view for EVERYONE (incl. logged-out visitors on
  // the wiki subdomain) — no profile gate.
  useEffect(() => {
    searchWiki("").then(r => setRecent(r || []));
    getRecentWikiEntries(6).then(r => setRecentlyAdded(r || []));
    getWikiStats().then(setStats);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const seq = ++reqSeq.current;
      setSearching(true);
      const r = await searchWiki(query);
      if (seq !== reqSeq.current) return; // stale response for an older query
      setResults(r || []);
      setSearching(false);
    }, 300);
    return () => { clearTimeout(t); reqSeq.current++; };
  }, [query]);

  // On the default view, drop entries already shown in the "Recently added"
  // strip so the "Most viewed" list below it doesn't repeat them.
  const recentIds = new Set(recentlyAdded.map(e => e.id));
  const list = query.trim() ? results : recent.filter(e => !recentIds.has(e.id));

  // Same plain-substring model as the Spec Search tab, so what's highlighted
  // is exactly what you typed.
  const tokens = tokenizeSearch(query);
  const trimmedQuery = query.trim();

  // Stash the query so the entry page can keep highlighting it after you
  // click through — sessionStorage for the embedded (in-app) switch, a URL
  // param for the standalone wiki-subdomain page (a real navigation).
  const persistQuery = () => {
    if (trimmedQuery) sessionStorage.setItem(LAST_QUERY_KEY, trimmedQuery);
    else sessionStorage.removeItem(LAST_QUERY_KEY);
  };
  const entryHref = slug => "/" + slug + (trimmedQuery ? "?q=" + encodeURIComponent(trimmedQuery) : "");

  const EntryRow = ({ e }) => {
    const slugMatchOnly = tokens.length > 0
      && !tokens.some(t => [(e.make||''), (e.model||''), (e.type||'')].some(f => f.toLowerCase().includes(t.toLowerCase())))
      && tokens.some(t => (e.slug||'').toLowerCase().includes(t.toLowerCase()));
    const specMatch = findSpecMatch(e.data, tokens);
    const inner = (
      <div style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + ACC, padding: "12px 16px", borderRadius: 2, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{hl(e.make, tokens)} <span style={{ color: ACC }}>{hl(e.model, tokens)}</span></div>
          {e.year && <span style={{ fontSize: 9, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{e.year}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {e.type && <span style={{ fontSize: 8, color: ACC, background: ACC + "12", border: "1px solid " + ACC + "33", padding: "1px 6px", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>{hl(e.type, tokens)}</span>}
          {slugMatchOnly && <span style={{ fontSize: 8, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{hl(e.slug, tokens)}</span>}
          <span style={{ fontSize: 8, color: MUT, marginLeft: "auto" }}>👁 {e.view_count || 0}</span>
        </div>
        {specMatch && (
          <div style={{ fontSize: 9, color: MUT, marginTop: 5, lineHeight: 1.4 }}>
            <span style={{ color: ACC, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 8 }}>{specMatch.label}:</span>{" "}
            {hl(specMatch.value, tokens)}
          </div>
        )}
      </div>
    );

    if (embedded) {
      return <div key={e.id} onClick={() => { persistQuery(); onSelect(e.slug); }} style={{ marginBottom: 10 }}>{inner}</div>;
    }
    return <a key={e.id} href={entryHref(e.slug)} onClick={persistQuery} style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>{inner}</a>;
  };

  const searchBox = (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search by make, model, type, or a spec (e.g. plug code)…"
      style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "8px 12px", borderRadius: 2, outline: "none", marginBottom: 14 }}
    />
  );

  const isDefault = !query.trim();
  const secLabel = t => (
    <div style={{ fontSize: 9, color: MUT, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, margin: "4px 0 10px" }}>{t}</div>
  );
  // Headline social proof — how much community knowledge lives here.
  const statsLine = stats && stats.entries > 0 && (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
      <div style={{ fontSize: 10, color: MUT, letterSpacing: "0.04em" }}>
        <span style={{ color: ACC, fontWeight: 700 }}>{stats.entries.toLocaleString()}</span> machine{stats.entries !== 1 ? "s" : ""} documented
        {stats.contributions > 0 && <> · <span style={{ color: ACC, fontWeight: 700 }}>{stats.contributions.toLocaleString()}</span> contribution{stats.contributions !== 1 ? "s" : ""}</>}
      </div>
      {embedded
        ? <button onClick={onShowLeaderboard} style={{ background: "none", border: "none", color: ACC, fontSize: 9, letterSpacing: "0.06em", cursor: "pointer", padding: 0, fontFamily: "'IBM Plex Mono',monospace" }}>🏆 Leaderboard</button>
        : <a href="/leaderboard" style={{ color: ACC, fontSize: 9, letterSpacing: "0.06em", textDecoration: "none", fontFamily: "'IBM Plex Mono',monospace" }}>🏆 Leaderboard</a>}
    </div>
  );
  // "Recently added" strip, shown only on the default (no-query) view.
  const recentStrip = isDefault && recentlyAdded.length > 0 && (
    <div style={{ marginBottom: 18 }}>
      {secLabel("Recently added")}
      {recentlyAdded.map(e => <EntryRow key={e.id} e={e} />)}
    </div>
  );

  if (embedded) {
    return (
      <div style={{ padding: "4px 0" }}>
        {searchBox}
        {statsLine}
        {searching && <div style={{ fontSize: 9, color: MUT, marginBottom: 10, letterSpacing: "0.06em" }}>Searching…</div>}
        {list.length === 0 && !searching && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>📖</div>
            {query.trim() ? "No results for that query." : "No wiki entries yet."}
          </div>
        )}
        {recentStrip}
        {list.length > 0 && isDefault && secLabel("Most viewed")}
        {list.map(e => <EntryRow key={e.id} e={e} />)}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: "'IBM Plex Mono',monospace" }}>
      <WikiHeader
        title="Rat Bench Wiki"
        subtitle="community machine specs"
        backHref="https://ratbench.net"
        backLabel="← App"
      />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {searchBox}
        {statsLine}
        {searching && <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>Searching…</div>}
        {list.length === 0 && !searching && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>
            {query.trim() ? "No results." : "No wiki entries yet."}
          </div>
        )}
        {recentStrip}
        {list.length > 0 && isDefault && secLabel("Most viewed")}
        {list.map(e => <EntryRow key={e.id} e={e} />)}
      </div>
    </div>
  );
}

export default WikiHomePage;
