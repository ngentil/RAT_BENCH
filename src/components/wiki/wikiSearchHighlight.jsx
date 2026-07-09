// Shared substring highlighter for wiki search — used by both the results
// list (WikiHomePage) and the individual entry page (WikiEntryPage) so a term
// you searched for stays visibly highlighted wherever it shows up, the same
// way the Spec Search tab flags which fields matched your query.
export function hl(text, tokens) {
  if (!tokens || !tokens.length || !text) return text;
  const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = String(text).split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  return parts.map((p, i) =>
    i % 2 === 1
      ? <mark key={i} style={{ background: '#1e3a1e', color: '#7fc97f', padding: '0 1px', borderRadius: 2 }}>{p}</mark>
      : p
  );
}
