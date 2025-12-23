import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutfitRequest {
  styleTags: string[];
  lockedItems?: { id: string; category: string }[];
  budget: number;
  gender?: string;
}

const CATEGORY_PRIORITY = ["tops", "bottoms", "shoes", "outerwear", "accessories"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body: OutfitRequest = await req.json();
    const { styleTags, lockedItems = [], budget, gender = "unisex" } = body;

    console.log("Outfit generation request:", { styleTags, lockedItems, budget, gender });

    // Calculate remaining budget after locked items
    let remainingBudget = budget;
    const lockedCategories = new Set(lockedItems.map((i) => i.category));

    // Get locked item prices
    if (lockedItems.length > 0) {
      const { data: lockedProducts } = await supabase
        .from("products")
        .select("id, price")
        .in("id", lockedItems.map((i) => i.id));

      if (lockedProducts) {
        const lockedTotal = lockedProducts.reduce((sum, p) => sum + p.price, 0);
        remainingBudget = budget - lockedTotal;
      }
    }

    console.log(`Remaining budget after locked items: €${remainingBudget}`);

    const outfitItems: Record<string, unknown>[] = [];
    const categoriesToFill = CATEGORY_PRIORITY.filter((cat) => !lockedCategories.has(cat));

    // Distribute budget across categories
    const budgetPerCategory = remainingBudget / categoriesToFill.length;

    for (const category of categoriesToFill) {
      let query = supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .or(`gender.eq.${gender},gender.eq.unisex`)
        .lte("price", budgetPerCategory * 1.5); // Allow 50% buffer

      // Apply style tags if provided
      if (styleTags && styleTags.length > 0) {
        query = query.overlaps("style_tags", styleTags);
      }

      const { data: products, error } = await query
        .order("price", { ascending: true })
        .limit(5);

      if (error) {
        console.error(`Error fetching ${category}:`, error);
        continue;
      }

      if (products && products.length > 0) {
        // Pick a product (prefer one closer to average budget)
        const targetPrice = budgetPerCategory;
        const selected = products.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.price - targetPrice);
          const currDiff = Math.abs(curr.price - targetPrice);
          return currDiff < prevDiff ? curr : prev;
        });

        outfitItems.push(selected);
        remainingBudget -= selected.price;
      }
    }

    // Calculate total price
    const totalPrice = outfitItems.reduce((sum, item) => sum + (item.price as number), 0);

    console.log(`Generated outfit with ${outfitItems.length} items, total: €${totalPrice}`);

    return new Response(
      JSON.stringify({
        outfit: outfitItems,
        totalPrice,
        remainingBudget: budget - totalPrice,
        lockedItems,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("outfits-generate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
