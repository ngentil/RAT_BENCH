const key = uid => `rat_tools_${uid}`;

export function getTools(userId) {
  try { return JSON.parse(localStorage.getItem(key(userId)) || '[]'); }
  catch { return []; }
}

export function saveToolItem(userId, tool) {
  const tools = getTools(userId);
  const now = new Date().toISOString();
  const idx = tools.findIndex(t => t.id === tool.id);
  if (idx >= 0) {
    tools[idx] = { ...tools[idx], ...tool, updatedAt: now };
  } else {
    tools.unshift({ ...tool, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
  }
  localStorage.setItem(key(userId), JSON.stringify(tools));
  return tools;
}

export function deleteToolItem(userId, toolId) {
  const tools = getTools(userId).filter(t => t.id !== toolId);
  localStorage.setItem(key(userId), JSON.stringify(tools));
  return tools;
}
