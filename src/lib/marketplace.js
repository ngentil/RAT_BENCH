import { supabase } from './supabase';

// ── Listings ─────────────────────────────────────────────────────────────────
// Listings snapshot the sellable item's data at listing time (see
// supabase/marketplace_listings.sql) so a listing survives the underlying
// Tracker machine / Part / Tool / Consumable / Equipment record being edited
// or deleted later. Machines/Tools/Equipment sell the whole physical item
// (no quantity); Parts/Consumables are fungible stock sold by the unit — for
// those, the DB trigger in marketplace_inventory_listings.sql atomically
// reserves the listed quantity out of the seller's stock, enforcing their
// optional "reserve for my workshop" floor server-side.
const LISTING_KIND_FIELDS = {
  machine:    (m) => ({ machine_id: m.id, make: m.make || null, model: m.model || null, type: m.type || null, year: m.year || null, photos: m.photos || [] }),
  part:       (p) => ({ part_id: p.id, make: p.brand || null, model: p.name || null, type: p.category || null, year: null, photos: p.photos || [] }),
  tool:       (t) => ({ tool_id: t.id, make: t.brand || null, model: t.model || null, type: t.category || null, year: null, photos: t.photos || [] }),
  consumable: (c) => ({ consumable_id: c.id, make: c.brand || null, model: c.name || null, type: c.category || null, year: null, photos: c.photos || [] }),
  equipment:  (e) => ({ equipment_id: e.id, make: e.make || null, model: e.model || null, type: e.type || null, year: e.year || null, photos: e.photos || [] }),
};

export async function createListing(kind, item, details, userId) {
  const { data, error } = await supabase.from('marketplace_listings').insert({
    seller_id:   userId,
    item_kind:   kind,
    title:       details.title,
    description: details.description || null,
    price:       details.price ?? null,
    location:    details.location || null,
    quantity:    details.quantity ?? null,
    ...LISTING_KIND_FIELDS[kind](item),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateListing(listingId, fields) {
  const { data, error } = await supabase.from('marketplace_listings')
    .update(fields).eq('id', listingId).select().single();
  if (error) throw error;
  return data;
}

export async function markListingSold(listingId) {
  return updateListing(listingId, { status: 'sold' });
}

export async function relistListing(listingId) {
  return updateListing(listingId, { status: 'active' });
}

export async function removeListing(listingId) {
  return updateListing(listingId, { status: 'removed' });
}

export async function getActiveListings({ type, query } = {}) {
  let q = supabase.from('marketplace_listings').select('*')
    .eq('status', 'active').order('created_at', { ascending: false });
  if (type) q = q.eq('type', type);
  if (query?.trim()) {
    const t = query.trim().replace(/[%_]/g, '\\$&');
    // Same substring model as the Wiki's default search — title, description,
    // and make/model so a query like "honda" or "gx390" both match.
    q = q.or(`title.ilike.%${t}%,description.ilike.%${t}%,make.ilike.%${t}%,model.ilike.%${t}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getListingById(listingId) {
  const { data, error } = await supabase.from('marketplace_listings')
    .select('*').eq('id', listingId).single();
  if (error) return null;
  return data;
}

// ── Public discovery (no auth required) ───────────────────────────────────────
// Mirrors the Wiki's public-reader mechanics — active listings are already
// readable by anon (marketplace_listings.sql's SELECT policy), this just adds
// the "most viewed" / "recently added" / view-count pieces on top.

// A single active listing by id, for the public /listing/:id page — same
// query getListingById already runs; RLS already scopes it to active-only
// for anon callers, no separate RPC needed.
export async function getPublicListing(listingId) {
  const { data, error } = await supabase.from('marketplace_listings')
    .select('*').eq('id', listingId).eq('status', 'active').single();
  if (error) return null;
  return data;
}

// Newest active listings first — for a "recently added" strip.
export async function getRecentListings(limit = 8) {
  const { data, error } = await supabase.from('marketplace_listings')
    .select('*').eq('status', 'active')
    .order('created_at', { ascending: false }).limit(limit);
  if (error) return [];
  return data || [];
}

// Most-viewed active listings — for the default discovery view.
export async function getMostViewedListings(limit = 20) {
  const { data, error } = await supabase.from('marketplace_listings')
    .select('*').eq('status', 'active')
    .order('view_count', { ascending: false }).limit(limit);
  if (error) return [];
  return data || [];
}

// Headline stat for the discovery home — how many listings are live.
export async function getMarketplaceStats() {
  const { count } = await supabase.from('marketplace_listings')
    .select('id', { count: 'exact', head: true }).eq('status', 'active');
  return { listings: count || 0 };
}

// Real view count, deduped per browser session same as the Wiki's
// incrementViewCount — the RPC itself is authenticated-only (see
// marketplace_public_mechanics.sql), so anon/public viewers don't increment it.
const _viewedThisSession = new Set();
export async function incrementListingViews(listingId) {
  if (_viewedThisSession.has(listingId)) return;
  _viewedThisSession.add(listingId);
  await supabase.rpc('increment_marketplace_listing_views', { listing_id: listingId });
}

export async function getMyListings(userId) {
  const { data, error } = await supabase.from('marketplace_listings')
    .select('*').eq('seller_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Messaging ────────────────────────────────────────────────────────────────
// 1:1 buyer<->seller threads per listing (see supabase/marketplace_messaging.sql).

export async function getOrCreateThread(listingId) {
  const { data, error } = await supabase.rpc('get_or_create_marketplace_thread', { p_listing_id: listingId });
  if (error) throw error;
  return data;
}

// Inbox — every thread the current user is a party to, newest activity first,
// with the listing and the other party's profile attached for display.
export async function getMyThreads(userId) {
  const { data: threads, error } = await supabase.from('marketplace_threads')
    .select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  if (error) throw error;
  if (!threads?.length) return [];

  const listingIds = [...new Set(threads.map(t => t.listing_id))];
  const otherIds = [...new Set(threads.map(t => t.buyer_id === userId ? t.seller_id : t.buyer_id))];

  const [{ data: listings }, { data: profiles }, { data: lastMessages }] = await Promise.all([
    supabase.from('marketplace_listings').select('*').in('id', listingIds),
    supabase.from('profiles').select('id,username,display_name').in('id', otherIds),
    supabase.from('marketplace_messages').select('*')
      .in('thread_id', threads.map(t => t.id))
      .order('created_at', { ascending: false }),
  ]);

  const listingById = Object.fromEntries((listings || []).map(l => [l.id, l]));
  const profileById = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  const lastMessageByThread = {};
  (lastMessages || []).forEach(m => { lastMessageByThread[m.thread_id] ||= m; });

  return threads
    .map(t => {
      const otherId = t.buyer_id === userId ? t.seller_id : t.buyer_id;
      return {
        ...t,
        listing: listingById[t.listing_id] || null,
        otherParty: profileById[otherId] || null,
        lastMessage: lastMessageByThread[t.id] || null,
      };
    })
    .sort((a, b) => {
      const at = a.lastMessage?.created_at || a.created_at;
      const bt = b.lastMessage?.created_at || b.created_at;
      return new Date(bt) - new Date(at);
    });
}

// A single thread with its listing and other-party profile attached — used
// when opening a thread directly (e.g. straight from "Message Seller")
// rather than via the inbox list.
export async function getThreadById(threadId, userId) {
  const { data: thread, error } = await supabase.from('marketplace_threads')
    .select('*').eq('id', threadId).single();
  if (error || !thread) return null;
  const otherId = thread.buyer_id === userId ? thread.seller_id : thread.buyer_id;
  const [{ data: listing }, { data: otherParty }] = await Promise.all([
    supabase.from('marketplace_listings').select('*').eq('id', thread.listing_id).single(),
    supabase.from('profiles').select('id,username,display_name').eq('id', otherId).single(),
  ]);
  return { ...thread, listing: listing || null, otherParty: otherParty || null };
}

export async function getThreadMessages(threadId) {
  const { data, error } = await supabase.from('marketplace_messages')
    .select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(threadId, senderId, body) {
  const { data, error } = await supabase.from('marketplace_messages').insert({
    thread_id: threadId, sender_id: senderId, body,
  }).select().single();
  if (error) throw error;
  return data;
}

// Marks every unread message from the other party in a thread as read —
// the per-message RLS policy already blocks a sender from marking their own.
export async function markThreadRead(threadId, userId) {
  const { error } = await supabase.from('marketplace_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .is('read_at', null)
    .neq('sender_id', userId);
  if (error) throw error;
}

export async function getMyUnreadCount() {
  const { data, error } = await supabase.rpc('get_my_marketplace_unread_count');
  if (error) { console.error('getMyUnreadCount:', error); return 0; }
  return data || 0;
}

// Realtime — new messages in a thread, mirroring App.jsx's machines-sync channel.
export function subscribeToThread(threadId, onMessage) {
  const channel = supabase
    .channel(`marketplace-thread-${threadId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace_messages', filter: `thread_id=eq.${threadId}` },
      (payload) => onMessage(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// Realtime — any new message addressed to this user, across all threads, for
// the inbox unread badge. Cheaper than filtering server-side on both buyer/
// seller id (Realtime filters support one column), so it listens broadly and
// lets the caller re-fetch the unread count on every event.
export function subscribeToMyMessages(userId, onChange) {
  const channel = supabase
    .channel(`marketplace-inbox-${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace_messages' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
