import { supabase } from '@/integrations/supabase/client';

export async function addFavorite(outfitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, outfit_id: outfitId });

  if (error) throw error;
}

export async function removeFavorite(outfitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('outfit_id', outfitId);

  if (error) throw error;
}

export async function getFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('outfit_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data?.map(f => f.outfit_id) || [];
}

export async function isFavorite(outfitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('outfit_id', outfitId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function createCollection(name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: user.id, name, description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCollections() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToCollection(collectionId: string, outfitId: string) {
  const { error } = await supabase
    .from('collection_items')
    .insert({ collection_id: collectionId, outfit_id: outfitId });

  if (error && !error.message.includes('duplicate')) throw error;
}

export async function removeFromCollection(collectionId: string, outfitId: string) {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('outfit_id', outfitId);

  if (error) throw error;
}

export async function getCollectionItems(collectionId: string) {
  const { data, error } = await supabase
    .from('collection_items')
    .select('outfit_id')
    .eq('collection_id', collectionId);

  if (error) throw error;
  return data?.map(item => item.outfit_id) || [];
}

export async function deleteCollection(collectionId: string) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) throw error;
}