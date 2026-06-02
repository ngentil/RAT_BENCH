import { supabase } from './supabase';

const BUCKET = 'photos';

const resizeToBlob = (file, maxW = 1800) => new Promise((res, rej) => {
  const img = new Image();
  const objUrl = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(objUrl);
    const r = Math.min(1, maxW / img.width);
    const c = document.createElement('canvas');
    c.width  = Math.round(img.width  * r);
    c.height = Math.round(img.height * r);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => b ? res(b) : rej(new Error('canvas toBlob failed')), 'image/jpeg', 0.92);
  };
  img.onerror = rej;
  img.src = objUrl;
});

export const uploadPhoto = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const blob = await resizeToBlob(file);
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

export const deletePhoto = (url) => {
  if (!url || !url.startsWith('https://')) return;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  supabase.storage.from(BUCKET).remove([path]);
};
