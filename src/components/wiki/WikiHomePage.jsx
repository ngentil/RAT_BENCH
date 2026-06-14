import React, { useState, useEffect } from 'react';
import { ACC, MUT, BRD, SURF, TXT, BG } from '../../lib/styles';
import { searchWiki, seedSampleWikiEntries } from '../../lib/wiki';
import { WikiHeader } from './WikiEntryPage';

function WikiHomePage({ onSelect, embedded = false, profile }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (profile?.id && localStorage.getItem("rat_wiki_seeded") !== "1") {
      seedSampleWikiEntries(profile).then(() => {
        localStorage.setItem("rat_wiki_seeded", "1");
        searchWiki("", profile.id).then(r => setRecent(r || []));
      });
    } else {
      searchWiki("", profile?.id).then(r => setRecent(r || []));
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchWiki(query, profile?.id);
      setResults(r || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, profile?.id]);

  const list = query.trim() ? results : recent;

  const EntryRow = ({ e }) => {
    const inner = (
      <div style={{ background: SURF, border: "1px solid " + BRD, borderLeft: "3px solid " + (e.is_sample ? "#555" : ACC), padding: "12px 16px", borderRadius: 2, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TXT }}>{e.make} <span style={{ color: e.is_sample ? "#888" : ACC }}>{e.model}</span></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {e.is_sample && <span style={{ fontSize: 7, color: "#666", border: "1px solid #333", padding: "1px 5px", borderRadius: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>sample</span>}
            {e.year && <span style={{ fontSize: 9, color: MUT, fontFamily: "'IBM Plex Mono',monospace" }}>{e.year}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {e.type && <span style={{ fontSize: 8, color: e.is_sample ? "#666" : ACC, background: (e.is_sample ? "#333" : ACC) + "12", border: "1px solid " + (e.is_sample ? "#333" : ACC) + "33", padding: "1px 6px", borderRadius: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>{e.type}</span>}
          <span style={{ fontSize: 8, color: MUT, marginLeft: "auto" }}>👁 {e.view_count || 0}</span>
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
      placeholder="Search by make, model or type…"
      style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid " + BRD, color: TXT, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "8px 12px", borderRadius: 2, outline: "none", marginBottom: 14 }}
    />
  );

  if (embedded) {
    return (
      <div style={{ padding: "4px 0" }}>
        {searchBox}
        {searching && <div style={{ fontSize: 9, color: MUT, marginBottom: 10, letterSpacing: "0.06em" }}>Searching…</div>}
        {list.length === 0 && !searching && (
          <div style={{ fontSize: 10, color: MUT, textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>📖</div>
            {query.trim() ? "No results for that query." : "No wiki entries yet."}
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
