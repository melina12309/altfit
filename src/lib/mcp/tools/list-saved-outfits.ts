import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_saved_outfits",
  title: "List saved outfits",
  description: "List the signed-in user's saved outfits, newest first, including items and total price.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Number of outfits to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("saved_outfits")
      .select("id, name, gender, budget, total_price, items, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { outfits: data ?? [] },
    };
  },
});
