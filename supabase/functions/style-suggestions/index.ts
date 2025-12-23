import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's data for context
    const [conversationsRes, outfitsRes, wardrobeRes] = await Promise.all([
      supabase
        .from("chat_conversations")
        .select("title, preview")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase
        .from("saved_outfits")
        .select("name, gender, total_price, items")
        .eq("user_id", user.id)
        .limit(10),
      supabase
        .from("user_wardrobe")
        .select("item_data")
        .eq("user_id", user.id)
        .limit(20),
    ]);

    const conversations = conversationsRes.data || [];
    const savedOutfits = outfitsRes.data || [];
    const wardrobe = wardrobeRes.data || [];

    // If no data, return empty suggestions
    if (conversations.length === 0 && savedOutfits.length === 0 && wardrobe.length === 0) {
      return new Response(JSON.stringify({ suggestions: [], hasData: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI
    const conversationSummary = conversations
      .map((c) => `"${c.title || c.preview}"`)
      .join(", ");
    
    const outfitSummary = savedOutfits
      .map((o) => {
        const items = o.items as Array<{ category: string; brand: string; name: string }>;
        return `${o.name} (${o.gender}, €${o.total_price}) with items: ${items?.slice(0, 3).map(i => i.name).join(", ")}`;
      })
      .join("; ");

    const wardrobeSummary = wardrobe
      .map((w) => {
        const item = w.item_data as { name: string; brand: string; category: string };
        return `${item?.name} by ${item?.brand}`;
      })
      .join(", ");

    const prompt = `Based on this user's fashion preferences and history, generate 4 personalized style suggestions.

User's recent chat topics: ${conversationSummary || "None"}
User's saved outfits: ${outfitSummary || "None"}
User's wardrobe items: ${wardrobeSummary || "None"}

Generate exactly 4 suggestions that match their style preferences. Each suggestion should be a cultural moment, trend, or style category they might like.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a fashion expert that analyzes user preferences and suggests style inspirations. 
            Always respond with valid JSON only, no markdown or extra text.
            The JSON should be an array of exactly 4 objects, each with:
            - "title": Short catchy title (2-4 words)
            - "description": Brief description (10-15 words)
            - "reason": Why this matches the user (8-12 words)
            - "category": One of "tv", "celebrities", "events", "vibes"`,
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_suggestions",
              description: "Return personalized style suggestions",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        reason: { type: "string" },
                        category: { type: "string", enum: ["tv", "celebrities", "events", "vibes"] },
                      },
                      required: ["title", "description", "reason", "category"],
                    },
                  },
                },
                required: ["suggestions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_suggestions" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to generate suggestions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract tool call result
    let suggestions = [];
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.suggestions || [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      suggestions = [];
    }

    return new Response(JSON.stringify({ suggestions, hasData: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in style-suggestions:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
