export type MessageContent = 
  | string 
  | { text: string; image?: string };

export type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string; // Base64 image data URL
};

export type OutfitItem = {
  category: "top" | "bottom" | "shoes" | "bag" | "accessory";
  product_id: string;
  name: string;
  brand: string;
  price: number;
  affiliate_url: string;
  image_url: string;
  style_tags: string[];
};

export type BudgetTier = {
  label: string;
  total_price: number;
  products: string[];
  note: string;
};

export type OutfitData = {
  look_title: string;
  inspiration: string;
  why_this_works: string;
  budget_range: {
    min: number;
    max: number;
  };
  outfit: OutfitItem[];
  budget_tiers: BudgetTier[];
  actions: {
    save: boolean;
    remix: boolean;
    shop: boolean;
  };
};

// Legacy type support for backward compatibility
export type LegacyOutfitItem = {
  category: string;
  name: string;
  brand: string;
  priceRange: string;
  note: string;
};

export type LegacyOutfitData = {
  title: string;
  inspiration: string;
  whyItWorks: string;
  items: LegacyOutfitItem[];
  budgetTiers: {
    budget: { total: string; note: string };
    mid: { total: string; note: string };
    premium: { total: string; note: string };
  };
};

export function parseOutfitFromMessage(content: string): OutfitData | null {
  const outfitMatch = content.match(/<outfit>([\s\S]*?)<\/outfit>/);
  if (!outfitMatch) return null;
  
  try {
    const parsed = JSON.parse(outfitMatch[1].trim());
    
    // Check if it's the new format
    if (parsed.look_title && parsed.outfit) {
      return parsed as OutfitData;
    }
    
    // Convert legacy format to new format
    if (parsed.title && parsed.items) {
      const legacy = parsed as LegacyOutfitData;
      return convertLegacyToNewFormat(legacy);
    }
    
    return null;
  } catch {
    return null;
  }
}

function convertLegacyToNewFormat(legacy: LegacyOutfitData): OutfitData {
  const parsePrice = (priceRange: string): number => {
    const match = priceRange.match(/€(\d+)/);
    return match ? parseInt(match[1], 10) : 50;
  };

  const parseTotalPrice = (total: string): number => {
    const match = total.match(/€(\d+)/);
    return match ? parseInt(match[1], 10) : 100;
  };

  return {
    look_title: legacy.title,
    inspiration: legacy.inspiration,
    why_this_works: legacy.whyItWorks,
    budget_range: {
      min: parseTotalPrice(legacy.budgetTiers.budget.total),
      max: parseTotalPrice(legacy.budgetTiers.premium.total)
    },
    outfit: legacy.items.map((item, idx) => ({
      category: item.category.toLowerCase() as OutfitItem["category"],
      product_id: `legacy-${idx}`,
      name: item.name,
      brand: item.brand,
      price: parsePrice(item.priceRange),
      affiliate_url: "",
      image_url: "",
      style_tags: []
    })),
    budget_tiers: [
      {
        label: `Under ${legacy.budgetTiers.budget.total}`,
        total_price: parseTotalPrice(legacy.budgetTiers.budget.total),
        products: legacy.items.slice(0, 3).map(i => i.category.toLowerCase()),
        note: legacy.budgetTiers.budget.note
      },
      {
        label: `Under ${legacy.budgetTiers.mid.total}`,
        total_price: parseTotalPrice(legacy.budgetTiers.mid.total),
        products: legacy.items.slice(0, 4).map(i => i.category.toLowerCase()),
        note: legacy.budgetTiers.mid.note
      },
      {
        label: `Under ${legacy.budgetTiers.premium.total}`,
        total_price: parseTotalPrice(legacy.budgetTiers.premium.total),
        products: legacy.items.map(i => i.category.toLowerCase()),
        note: legacy.budgetTiers.premium.note
      }
    ],
    actions: {
      save: true,
      remix: true,
      shop: true
    }
  };
}

export function getTextWithoutOutfit(content: string): string {
  return content.replace(/<outfit>[\s\S]*?<\/outfit>/g, "").trim();
}

import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/style-chat`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    // Get the current user's session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      onError("Please sign in to use the style assistant");
      return;
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      onError(errorData.error || `Request failed with status ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          /* ignore */
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Connection failed");
  }
}

// Helper to convert File to base64 data URL
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
