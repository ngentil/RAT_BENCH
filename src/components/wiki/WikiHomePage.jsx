import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, BG } from '../../lib/styles';
import { searchWiki } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';

// onSelect(slug) — called when user clicks an entry.
// In standalone mode (wiki.ratbench.net) this is undefined and <a> tags handle navigation.
// In embedded mode (app Wiki tab) the parent passes onSelect to navigate inline.
function WikiHomePage({ onSelect, embedded = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    searchWiki("").then(r => setRecent(r || []));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchWiki(query);
      setResults(r || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const list = query.trim() ? results : recent;

  const EntryRow = ({ e }) => {
    const inner = (
      <div style={{ background: SURF, border: "1px solid " + BRD, padding: "12px 16px", borderRadius: 2, cursor: "pointer" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: ACC, marginBottom: 4 }}>{e.make} {e.model}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {e.type && <span style={{ fontSize: 10, color: MUT }}>{e.type}</span>}
          {e.year && <span style={{ fontSize: 10, color: MUT }}>{e.year}</span>}
          <span style={{ fontSize: 10, color: MUT, marginLeft: "auto" }}>{e.view_count || 0} views</span>
        </div>
      </div>
    );

    if (embedded) {
      return <div key={e.id} onClick={() => onSelect(e.slug)} style={{ marginBottom: 10 }}>{inner}</div>;
    }
    return <a key={e.id} href={"/" + e.slug} style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>{inner}</a>;
  };

  const searchBox = (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search machines..."
      style={{ width: "100%", boxSizing: "border-box", background: SURF, border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, padding: "10px 14px", borderRadius: 2, outline: "none", marginBottom: 20 }}
    />
  );

  if (embedded) {
    return (
      <div style={{ padding: "16px 0" }}>
        {searchBox}
        {searching && <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>Searching…</div>}
        {list.length === 0 && !searching && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>
            {query.trim() ? "No results." : "No wiki entries yet."}
          </div>
        )}
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
        {searching && <div style={{ fontSize: 10, color: MUT, marginBottom: 12 }}>Searching…</div>}
        {list.length === 0 && !searching && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", marginTop: 40 }}>
            {query.trim() ? "No results." : "No wiki entries yet."}
          </div>
        )}
        {list.map(e => <EntryRow key={e.id} e={e} />)}
      </div>
    </div>
  );
}

export default WikiHomePage;
