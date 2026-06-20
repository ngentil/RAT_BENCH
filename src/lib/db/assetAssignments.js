import { supabase } from '../supabase';

export async function getAssignedTo(parentType, parentId) {
  const { data, error } = await supabase
    .from('asset_assignments')
    .select('*')
    .eq('parent_type', parentType)
    .eq('parent_id', parentId)
    .order('assigned_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAssignedIn(childType, childId) {
  const { data, error } = await supabase
    .from('asset_assignments')
    .select('*')
    .eq('child_type', childType)
    .eq('child_id', childId)
    .order('assigned_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function assignAsset({ parentType, parentId, parentName, childType, childId, childName, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('asset_assignments')
    .insert({
      parent_type: parentType,
      parent_id:   parentId,
      parent_name: parentName || '',
      child_type:  childType,
      child_id:    childId,
      child_name:  childName,
      user_id:     user.id,
      notes:       notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unassignAsset(id) {
  const { error } = await supabase
    .from('asset_assignments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function unassignAllByParent(parentType, parentId) {
  const { error } = await supabase
    .from('asset_assignments')
    .delete()
    .eq('parent_type', parentType)
    .eq('parent_id', parentId);
  if (error) throw error;
}

export async function unassignAllByChild(childType, childId) {
  const { error } = await supabase
    .from('asset_assignments')
    .delete()
    .eq('child_type', childType)
    .eq('child_id', childId);
  if (error) throw error;
}

export async function syncAssignmentChildName(childType, childId, childName) {
  if (!childId || !childName) return;
  await supabase
    .from('asset_assignments')
    .update({ child_name: childName })
    .eq('child_type', childType)
    .eq('child_id', childId);
}

export async function syncAssignmentParentName(parentType, parentId, parentName) {
  if (!parentId || !parentName) return;
  await supabase
    .from('asset_assignments')
    .update({ parent_name: parentName })
    .eq('parent_type', parentType)
    .eq('parent_id', parentId);
}
