import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the ALT-FIT product catalog by keyword, category, gender, and maximum price. Returns shoppable items with prices and affiliate links.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword to match against product title or brand."),
    category: z.string().trim().optional().describe("Product category, e.g. top, bottom, shoes, bag."),
    gender: z.string().trim().optional().describe("Target gender, e.g. women, men, unisex."),
    max_price: z.number().positive().optional().describe("Maximum price in the catalog currency."),
    limit: z.number().int().min(1).max(50).optional().describe("Number of products to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, gender, max_price, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let builder = supabase
      .from("products")
      .select(
        "id, title, brand, price, currency, category, gender, retailer, style_tags, colors, image_url, affiliate_url",
      )
      .eq("is_active", true)
      .order("last_seen_at", { ascending: false })
      .limit(limit ?? 10);

    if (query) builder = builder.or(`title.ilike.%${query}%,brand.ilike.%${query}%`);
    if (category) builder = builder.eq("category", category);
    if (gender) builder = builder.eq("gender", gender);
    if (typeof max_price === "number") builder = builder.lte("price", max_price);

    const { data, error } = await builder;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
