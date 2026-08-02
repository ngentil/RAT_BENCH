import { jsPDF } from 'jspdf';
import { upsertMachine } from './db';
import { getNextInvoiceNumber, getNextQuoteNumber } from './db/invoices';
import { createDocument, mergeDocument } from './db/billingDocuments';
import { toastError } from './toast';

const round2 = n => Math.round(n * 100) / 100;
// Explicit qty 0 means 0 (returned/credited item) — only missing qty defaults to 1
const qtyOf = p => (p.qty == null || p.qty === '') ? 1 : (Number(p.qty) || 0);

function fmtDuration(secs) {
  secs = Math.max(0, Math.floor(Number(secs) || 0));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// CompanySettings only ever stores logos as data: URLs (FileReader.readAsDataURL) —
// a remote https URL can't be embedded synchronously, so it's skipped rather than
// half-supported.
function logoFormat(dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp)/i.exec(String(dataUrl || ''));
  if (!m) return null;
  const ext = m[1].toLowerCase();
  return ext === 'webp' ? 'WEBP' : (ext === 'jpg' || ext === 'jpeg') ? 'JPEG' : 'PNG';
}

// Renders the actual PDF from a snapshot-shaped object — the SAME shape
// that gets persisted to billing_documents, so a document can be faithfully
// reprinted later (via regenerateDocument, from either its current state or
// an archived revision) without needing the live machine/client rows at all.
function drawDocumentPdf({ docType, docRef, docDate, company, snapshot }) {
  const isQuote  = docType === 'quote';
  const docLabel = isQuote ? 'QUOTE' : 'INVOICE';
  const co       = company || {};
  const {
    machineName, machineSub, clientName, clientEmail, clientPhone, clientAddress,
    labour = [], parts = [], subtotal, tax, taxRate, total, rate,
  } = snapshot;
  const taxLabel  = co.tax_label || 'Tax';
  const totalSecs = labour.reduce((s, l) => s + (l.seconds || 0), 0);
  const fmt$      = n => `$${(n || 0).toFixed(2)}`;

  const coAddress = [co.address, co.city, co.state, co.postcode, co.country].filter(Boolean).join(', ');
  const coContact = [co.abn ? `ABN ${co.abn}` : null, co.phone, co.email].filter(Boolean).join('  ·  ');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 14, col = W - margin * 2;
  const right = margin + col;
  let y = margin;

  const pageBreak = (need = 8) => { if (y + need > 282) { doc.addPage(); y = margin; } };

  const addLine = (text, size = 9, bold = false, color = [40, 40, 40], indent = 0) => {
    doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), col - indent);
    lines.forEach(l => { pageBreak(size * 0.5); doc.text(l, margin + indent, y); y += size * 0.45 + 1; });
  };

  // Bold label left, value right-aligned on the same baseline — used for every
  // line-item row (labour session, part) and every totals row.
  const addLineLR = (left, rightText, size = 9.5, bold = true, color = [20, 20, 20]) => {
    pageBreak(size * 0.5);
    doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...color);
    const rightW = doc.getTextWidth(rightText);
    const leftLines = doc.splitTextToSize(left, col - rightW - 4);
    doc.text(leftLines[0] || '', margin, y);
    doc.text(rightText, right, y, { align: 'right' });
    y += size * 0.45 + 1;
    for (let i = 1; i < leftLines.length; i++) { pageBreak(size * 0.45); doc.text(leftLines[i], margin, y); y += size * 0.45 + 1; }
  };

  const sectionHead = (title) => {
    pageBreak(10);
    y += 2;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 140, 140);
    doc.text(title.toUpperCase(), margin, y);
    doc.setDrawColor(224, 224, 224); doc.setLineWidth(0.3);
    doc.line(margin, y + 1.5, right, y + 1.5);
    y += 6.5;
  };

  // ---- Header: company block (left) + doc type/ref/date (right) ----
  const logoFmt = co.logo ? logoFormat(co.logo) : null;
  let textX = margin;
  if (logoFmt) {
    try { doc.addImage(co.logo, logoFmt, margin, y, 16, 16); textX = margin + 20; }
    catch (e) { console.error('invoice logo embed:', e); }
  }
  let coY = y + 4;
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
  doc.text(co.name || 'My Business', textX, coY); coY += 5;
  if (co.trading_name) { doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110); doc.text(co.trading_name, textX, coY); coY += 4.5; }
  if (coContact) { doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110); doc.text(coContact, textX, coY); coY += 4; }
  if (coAddress) { doc.setFontSize(8); doc.setTextColor(110, 110, 110); doc.text(doc.splitTextToSize(coAddress, 110), textX, coY); coY += 4; }

  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 103, 10);
  doc.text(docLabel, right, y + 8, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
  doc.text(docRef, right, y + 14, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110);
  const dateLine = `${isQuote ? 'Date' : 'Invoice Date'}: ${new Date(docDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  doc.text(dateLine, right, y + 19, { align: 'right' });
  if (!isQuote) doc.text('Due: On receipt', right, y + 23, { align: 'right' });

  y = Math.max(coY, y + 26) + 4;
  doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.6);
  doc.line(margin, y, right, y);
  y += 8;

  // ---- Bill To / Machine block ----
  const midTop = y;
  if (clientName) {
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(160, 160, 160);
    doc.text('BILL TO', margin, y);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
    doc.text(clientName || '', margin, y + 5);
    let cy = y + 9.5;
    [clientEmail, clientPhone, clientAddress].filter(Boolean).forEach(line => {
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
      const lines = doc.splitTextToSize(line, 100);
      doc.text(lines, margin, cy); cy += lines.length * 3.8;
    });
  }

  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(160, 160, 160);
  doc.text(isQuote ? 'FOR' : 'RE', right, midTop, { align: 'right' });
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
  doc.text(machineName || '', right, midTop + 5, { align: 'right' });
  if (machineSub) {
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110);
    doc.text(doc.splitTextToSize(machineSub, 100), right, midTop + 9.5, { align: 'right' });
  }

  y = midTop + 24;

  // ---- Labour ----
  if (labour.length) {
    sectionHead('Labour');
    labour.forEach(l => {
      const hrs = (l.seconds || 0) / 3600;
      addLineLR(l.label || 'General work', l.amount != null ? fmt$(l.amount) : '—', 9.5, true);
      const sub = `${fmtDuration(l.seconds || 0)} (${hrs.toFixed(2)} hrs)${rate != null ? `  ·  $${Number(rate).toFixed(2)}/hr` : ''}`;
      addLine(sub, 7.5, false, [150, 150, 150]);
      if (l.notes) addLine(l.notes, 7.5, false, [140, 140, 140]);
      pageBreak(4);
      doc.setDrawColor(240, 240, 240); doc.setLineWidth(0.2);
      doc.line(margin, y, right, y);
      y += 3;
    });
  }

  // ---- Parts & Materials ----
  if (parts.length) {
    sectionHead('Parts & Materials');
    parts.forEach(p => {
      addLineLR(p.name || '', p.sellEach > 0 ? fmt$(p.amount) : '—', 9.5, true);
      const sub = `Qty ${p.qty}${p.sellEach > 0 ? `  ·  ${fmt$(p.sellEach)} ea` : ''}${p.tag ? `  ·  ${p.tag}` : ''}`;
      addLine(sub, 7.5, false, [150, 150, 150]);
      pageBreak(4);
      doc.setDrawColor(240, 240, 240); doc.setLineWidth(0.2);
      doc.line(margin, y, right, y);
      y += 3;
    });
  }

  // ---- Totals ----
  const labourSubtotal = rate != null ? round2(labour.reduce((s, l) => s + (l.amount || 0), 0)) : null;
  const partsSubtotal  = round2(parts.reduce((s, p) => s + (p.amount || 0), 0));
  y += 3;
  if (labourSubtotal !== null) addLineLR('Labour', fmt$(labourSubtotal), 9, false, [90, 90, 90]);
  if (partsSubtotal > 0)       addLineLR('Parts',  fmt$(partsSubtotal), 9, false, [90, 90, 90]);
  if (tax != null)             addLineLR(`${taxLabel} (${taxRate}%)`, fmt$(tax), 9, false, [90, 90, 90]);
  pageBreak(10);
  doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.5);
  doc.line(right - 75, y, right, y);
  y += 5;
  addLineLR(total != null ? 'Total' : 'Total Time', total != null ? fmt$(total) : fmtDuration(totalSecs), 13, true, [20, 20, 20]);

  if (!rate) { y += 2; addLine('Set a Labour Rate in Settings → Company to calculate amounts.', 7.5, false, [170, 170, 170]); }

  y += 6;
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(190, 190, 190);
  doc.text('Generated by Rat Bench · ratbench.net', margin, y);

  return doc;
}

// existingDoc: pass the billing_documents row to merge into (reuses its
// doc_ref, refreshes its snapshot/total in place, archiving what it held
// before into revisions) — omit/null to mint a brand-new numbered document
// instead. The caller (Bench's Quote/Invoice buttons) decides which via the
// regenerate merge-or-copy prompt.
export async function generateInvoicePDF(machine, company, clients, userId, docType = 'invoice', onUpdate, existingDoc = null) {
  const allLog   = machine.timeLog || [];
  const allParts = machine.parts   || [];
  // Sessions/parts already invoiced must not be billed again. (Cycle a
  // session's or part's status chip back to "Logged" to deliberately re-issue.)
  const log   = allLog.filter(e => (e.billStatus || 'logged') !== 'invoiced');
  const parts = allParts.filter(p => (p.billStatus || 'logged') !== 'invoiced');
  if (!log.length && !parts.length) {
    if (allLog.length || allParts.length) alert('Everything here is already invoiced. Tap a session\'s or part\'s status chip to set it back to Logged if you need to re-issue.');
    return;
  }

  const client = machine.clientId ? (clients || []).find(c => c.id === machine.clientId) : null;

  // parseFloat + isFinite so a configured rate of 0 is honoured (not "unset")
  const rateRaw = parseFloat(company?.hourly_rate);
  const rate    = Number.isFinite(rateRaw) ? rateRaw : null;
  const taxRaw  = parseFloat(company?.tax_rate);
  const taxRate = Number.isFinite(taxRaw) ? taxRaw : null;

  // Round each line to cents and sum the rounded lines — printed rows must
  // add up to the printed subtotals/total exactly.
  const labourAmounts  = log.map(e => rate !== null ? round2(((e.seconds || 0) / 3600) * rate) : null);
  const labourSubtotal = rate !== null ? round2(labourAmounts.reduce((s, a) => s + a, 0)) : null;
  const partAmounts    = parts.map(p => round2((parseFloat(p.sellPrice) || 0) * qtyOf(p)));
  const partsSubtotal  = round2(partAmounts.reduce((s, a) => s + a, 0));
  const subtotal       = labourSubtotal !== null ? round2(labourSubtotal + partsSubtotal) : (partsSubtotal > 0 ? partsSubtotal : null);
  const tax            = subtotal !== null && taxRate ? round2(subtotal * taxRate / 100) : null;
  const total          = subtotal !== null ? round2(subtotal + (tax || 0)) : null;

  const isQuote  = docType === 'quote';
  const docLabel = isQuote ? 'QUOTE' : 'INVOICE';
  // Merging into an existing document reuses its number; otherwise mint a
  // fresh sequential one (quotes now get a real counter too, not a timestamp).
  const docRef     = existingDoc?.doc_ref || (isQuote ? await getNextQuoteNumber(userId) : await getNextInvoiceNumber(userId));
  const machineSub = [machine.year, machine.make, machine.model, machine.serial ? `S/N ${machine.serial}` : null].filter(Boolean).join(' · ');

  // Snapshot doubles as (a) the data the PDF is drawn from and (b) exactly
  // what gets persisted to billing_documents — one source of truth for what
  // "this document" contains, so a later regenerate reproduces it faithfully.
  const snapshot = {
    machineName: machine.name || '',
    machineSub,
    clientName: client?.name || null,
    clientEmail: client?.email || null,
    clientPhone: client?.phone || null,
    clientAddress: client?.address || null,
    labour: log.map((e, i) => ({
      label: e.jobLabel && e.jobLabel !== 'Job' ? e.jobLabel.slice(0, 80) : 'General work',
      seconds: e.seconds || 0, amount: labourAmounts[i], notes: e.sessionNotes || null,
    })),
    parts: parts.map((p, i) => ({
      name: p.name || '', qty: qtyOf(p), amount: partAmounts[i],
      sellEach: parseFloat(p.sellPrice) || 0, tag: [p.brand, p.partNumber].filter(Boolean).join(' · '),
    })),
    subtotal, tax, taxRate, total, rate,
  };

  const doc = drawDocumentPdf({ docType, docRef, docDate: new Date().toISOString(), company, snapshot });
  const filename = `${docRef}_${(machine.name || docLabel).replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);

  // Log this generation to billing_documents (Office → Quotes/Invoices).
  // Merging archives the prior snapshot into revisions and refreshes the
  // existing row in place; otherwise a new row is created alongside any
  // prior documents for this machine.
  try {
    if (existingDoc) await mergeDocument(existingDoc.id, { clientId: client?.id || null, snapshot, total });
    else await createDocument({ machineId: machine.id, clientId: client?.id || null, docType, docRef, snapshot, total });
  } catch (err) {
    console.error('billing_documents log:', err);
    // The DB-side rate limiter (supabase/document_rate_limit.sql) raises a
    // message prefixed this way specifically so it can be told apart from a
    // genuine connectivity failure here — "check your connection" would be
    // actively misleading for a rate-limit rejection.
    const rateLimited = String(err?.message || '').startsWith('RATE_LIMITED:');
    toastError(rateLimited
      ? `${docLabel === 'QUOTE' ? 'Quote' : 'Invoice'} PDF downloaded, but wasn't logged under Office — ${err.message.replace(/^RATE_LIMITED:\s*/, '')}`
      : `${docLabel === 'QUOTE' ? 'Quote' : 'Invoice'} generated, but couldn't log it under Office — check connection`);
  }

  // Mark the billed sessions/parts so the next invoice doesn't re-charge them.
  if (!isQuote && onUpdate) {
    const billedSessions = new Set(log.map(e => e.id));
    const billedParts    = new Set(parts.map(p => p.id));
    const updated = {
      ...machine,
      timeLog: allLog.map(e => billedSessions.has(e.id) ? { ...e, billStatus: 'invoiced' } : e),
      parts:   allParts.map(p => billedParts.has(p.id)   ? { ...p, billStatus: 'invoiced' } : p),
    };
    onUpdate(updated);
    try { await upsertMachine(updated); }
    catch (err) {
      console.error('mark invoiced:', err);
      toastError("Invoice created, but couldn't mark sessions/parts as invoiced — check connection");
    }
  }
}

// Re-downloads a document straight from its stored snapshot — for when the
// original PDF got lost/deleted. No side effects: doesn't touch machine
// billStatus and doesn't write to billing_documents at all.
// revisionIndex omitted/null = the document's current state; otherwise an
// index into its `revisions` array (archived pre-merge states, oldest first).
export function regenerateDocument(doc, company, revisionIndex = null) {
  const source = revisionIndex != null && doc.revisions?.[revisionIndex]
    ? { snapshot: doc.revisions[revisionIndex].snapshot, docDate: doc.revisions[revisionIndex].archived_at }
    : { snapshot: doc.snapshot, docDate: doc.created_at };

  const pdf = drawDocumentPdf({ docType: doc.doc_type, docRef: doc.doc_ref, docDate: source.docDate, company, snapshot: source.snapshot });
  const docLabel = doc.doc_type === 'quote' ? 'QUOTE' : 'INVOICE';
  const versionSuffix = revisionIndex != null ? `_v${revisionIndex + 1}` : '';
  const filename = `${doc.doc_ref}${versionSuffix}_${(source.snapshot.machineName || docLabel).replace(/[^a-z0-9]/gi, '_')}.pdf`;
  pdf.save(filename);
}
