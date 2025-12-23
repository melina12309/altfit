import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { OutfitItemData, Gender } from "@/lib/outfitData";
import type { Json } from "@/integrations/supabase/types";

export type SavedOutfit = {
  id: string;
  name: string;
  gender: Gender;
  items: OutfitItemData[];
  total_price: number;
  budget: number | null;
  created_at: string;
  updated_at: string;
};

export function useOutfitBuilder() {
  const { user } = useAuth();

  // Load user's locked/owned items from wardrobe
  const loadWardrobe = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_wardrobe")
      .select("item_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load wardrobe:", error);
      return [];
    }

    return data.map((item) => item.item_id);
  }, [user]);

  // Add item to wardrobe (lock/own)
  const addToWardrobe = useCallback(async (itemId: string, itemData: OutfitItemData) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_wardrobe")
      .upsert([{
        user_id: user.id,
        item_id: itemId,
        item_data: JSON.parse(JSON.stringify(itemData)) as Json,
      }], { onConflict: "user_id,item_id" });

    if (error) {
      console.error("Failed to add to wardrobe:", error);
      throw error;
    }
  }, [user]);

  // Remove item from wardrobe (unlock)
  const removeFromWardrobe = useCallback(async (itemId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_wardrobe")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId);

    if (error) {
      console.error("Failed to remove from wardrobe:", error);
      throw error;
    }
  }, [user]);

  // Save a complete outfit
  const saveOutfit = useCallback(async (
    name: string,
    gender: Gender,
    items: OutfitItemData[],
    totalPrice: number,
    budget?: number
  ): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("saved_outfits")
      .insert([{
        user_id: user.id,
        name,
        gender,
        items: JSON.parse(JSON.stringify(items)) as Json,
        total_price: totalPrice,
        budget: budget || null,
      }])
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save outfit:", error);
      throw error;
    }

    return data.id;
  }, [user]);

  // Get all saved outfits
  const getSavedOutfits = useCallback(async (): Promise<SavedOutfit[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_outfits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load saved outfits:", error);
      return [];
    }

    return (data || []).map((outfit) => ({
      ...outfit,
      items: outfit.items as unknown as OutfitItemData[],
      gender: outfit.gender as Gender,
    }));
  }, [user]);

  // Delete a saved outfit
  const deleteOutfit = useCallback(async (outfitId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("saved_outfits")
      .delete()
      .eq("id", outfitId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete outfit:", error);
      throw error;
    }
  }, [user]);

  // Generate shareable URL
  const generateShareUrl = useCallback((gender: Gender, items: OutfitItemData[], budget: number) => {
    const shareData = {
      g: gender,
      b: budget,
      i: items.map((item) => ({
        id: item.id,
        n: item.name,
        br: item.brand,
        p: item.price,
        c: item.category,
        img: item.image,
      })),
    };
    
    const encoded = btoa(JSON.stringify(shareData));
    return `${window.location.origin}/builder?share=${encoded}`;
  }, []);

  // Parse shared outfit from URL
  const parseShareUrl = useCallback((shareParam: string): { gender: Gender; items: OutfitItemData[]; budget: number } | null => {
    try {
      const decoded = JSON.parse(atob(shareParam));
      return {
        gender: decoded.g as Gender,
        budget: decoded.b,
        items: decoded.i.map((item: { id: string; n: string; br: string; p: number; c: string; img: string }) => ({
          id: item.id,
          name: item.n,
          brand: item.br,
          price: item.p,
          category: item.c,
          image: item.img,
          isLocked: false,
        })),
      };
    } catch {
      console.error("Failed to parse share URL");
      return null;
    }
  }, []);

  return {
    loadWardrobe,
    addToWardrobe,
    removeFromWardrobe,
    saveOutfit,
    getSavedOutfits,
    deleteOutfit,
    generateShareUrl,
    parseShareUrl,
  };
}
