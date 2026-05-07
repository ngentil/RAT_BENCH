const key = uid => `rat_inventory_${uid}`;

export function getInventory(userId) {
  try { return JSON.parse(localStorage.getItem(key(userId)) || '[]'); }
  catch { return []; }
}

export function saveInventoryItem(userId, item) {
  const inv = getInventory(userId);
  const now = new Date().toISOString();
  const idx = inv.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    inv[idx] = { ...inv[idx], ...item, updatedAt: now };
  } else {
    inv.push({ ...item, id: item.id || crypto.randomUUID(), createdAt: now, updatedAt: now });
  }
  localStorage.setItem(key(userId), JSON.stringify(inv));
  return inv;
}

export function deleteInventoryItem(userId, itemId) {
  const inv = getInventory(userId).filter(i => i.id !== itemId);
  localStorage.setItem(key(userId), JSON.stringify(inv));
  return inv;
}

// delta: negative to deduct (use), positive to restock
export function adjustStock(userId, itemId, delta) {
  const inv = getInventory(userId).map(i =>
    i.id !== itemId ? i : { ...i, stockQty: Math.max(0, (Number(i.stockQty) || 0) + delta), updatedAt: new Date().toISOString() }
  );
  localStorage.setItem(key(userId), JSON.stringify(inv));
  return inv;
}
