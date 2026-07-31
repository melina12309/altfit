import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_style_profile",
  title: "Get style profile",
  description:
    "Get the signed-in user's saved style preferences (favourite styles, budget, sizes) to personalise outfit suggestions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_style_preferences")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: data ? JSON.stringify(data) : "No style preferences saved yet for this user.",
        },
      ],
      structuredContent: { preferences: data ?? null },
    };
  },
});
