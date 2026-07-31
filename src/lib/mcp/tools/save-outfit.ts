import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const OutfitItemSchema = z.object({
  category: z.string().trim().describe("Item category, e.g. top, bottom, shoes, bag."),
  product_id: z.string().trim().optional().describe("Product id from search_products, when the item is from the catalog."),
  name: z.string().trim().describe("Item name."),
  brand: z.string().trim().optional(),
  price: z.number().nonnegative().describe("Item price."),
  image_url: z.string().trim().optional(),
  affiliate_url: z.string().trim().optional(),
});

export default defineTool({
  name: "save_outfit",
  title: "Save outfit",
  description: "Save a new outfit to the signed-in user's ALT-FIT collection.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Name of the look."),
    gender: z.string().trim().min(1).describe("Target gender, e.g. women, men, unisex."),
    items: z.array(OutfitItemSchema).min(1).describe("The pieces that make up the outfit."),
    budget: z.number().positive().optional().describe("Optional budget for the look."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, gender, items, budget }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const total_price = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    const { data, error } = await supabase
      .from("saved_outfits")
      .insert({ user_id: ctx.getUserId(), name, gender, items, budget: budget ?? null, total_price })
      .select("id, name, gender, budget, total_price, items, created_at");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { outfit: data?.[0] ?? null },
    };
  },
});
