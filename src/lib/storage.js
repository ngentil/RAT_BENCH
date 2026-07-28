import { supabase } from './supabase';

const BUCKET = 'photos';

const resizeToBlob = (file, maxW = 1800, maxH = 1800) => new Promise((res, rej) => {
  const img = new Image();
  const objUrl = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(objUrl);
    const r = Math.min(1, maxW / img.width, maxH / img.height);
    const c = document.createElement('canvas');
    c.width  = Math.round(img.width  * r);
    c.height = Math.round(img.height * r);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => b ? res(b) : rej(new Error('canvas toBlob failed')), 'image/jpeg', 0.92);
  };
  img.onerror = () => {
    URL.revokeObjectURL(objUrl);
    rej(new Error('Unsupported image format'));
  };
  img.src = objUrl;
});

export const uploadPhoto = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const blob = await resizeToBlob(file);
  // Server bucket limit is 10MB — fail with a clear message instead of a
  // generic storage error after the round trip.
  if (blob.size > 10 * 1024 * 1024) throw new Error('Image too large — try a smaller photo');
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

// Best-effort cleanup — resolves to a success boolean, never throws.
export const deletePhoto = async (url) => {
  if (!url || !url.startsWith('https://')) return false;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return false;
  const path = url.slice(idx + marker.length);
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.warn('deletePhoto: remove failed', path, error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('deletePhoto: remove failed', path, e);
    return false;
  }
};

const DOCS_BUCKET = 'documents';
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // matches the bucket's file_size_limit

// Unlike uploadPhoto, documents are uploaded as-is — no canvas re-encode
// (that trick is image-only), so the size/mime checks happen up front
// instead of after a resize.
export const uploadDocument = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (file.type !== 'application/pdf') throw new Error('Only PDF files are supported');
  if (file.size > MAX_DOCUMENT_BYTES) throw new Error('File too large — max 25MB');
  const path = `${user.id}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(DOCS_BUCKET).upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(DOCS_BUCKET).getPublicUrl(path).data.publicUrl;
};

// Best-effort cleanup — resolves to a success boolean, never throws.
export const deleteDocument = async (url) => {
  if (!url || !url.startsWith('https://')) return false;
  const marker = `/object/public/${DOCS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return false;
  const path = url.slice(idx + marker.length);
  try {
    const { error } = await supabase.storage.from(DOCS_BUCKET).remove([path]);
    if (error) {
      console.warn('deleteDocument: remove failed', path, error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('deleteDocument: remove failed', path, e);
    return false;
  }
};

export const deleteUserPhotos = async (userId) => {
  const limit = 1000;
  for (;;) {
    // Offset stays 0: each removed page shifts the remaining files forward.
    const { data: files, error } = await supabase.storage.from(BUCKET).list(userId, { limit });
    if (error) {
      console.warn('deleteUserPhotos: list failed', userId, error);
      return;
    }
    if (!files?.length) return;
    const paths = files.map(f => `${userId}/${f.name}`);
    const { error: rmError } = await supabase.storage.from(BUCKET).remove(paths);
    if (rmError) {
      console.warn('deleteUserPhotos: remove failed', userId, rmError);
      return;
    }
    if (files.length < limit) return;
  }
};
