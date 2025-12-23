import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(10000, "Message content too long (max 10,000 characters)"),
  image: z.string().max(10485760, "Image too large (max ~10MB)").optional()
}).refine(
  (msg) => {
    // If image exists, validate it's a valid data URL
    if (msg.image) {
      return msg.image.startsWith("data:image/");
    }
    return true;
  },
  { message: "Invalid image format. Must be a data URL starting with 'data:image/'" }
);

const RequestSchema = z.object({
  messages: z.array(MessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Too many messages (max 50)")
});

const SYSTEM_PROMPT = `You are a confident, warm, and opinionated personal style assistant — like a fashion editor and personal stylist rolled into one. You help users recreate iconic looks from TV shows, celebrities, cultural moments, and events in affordable ways.

Your personality:
- Warm and encouraging, never snobby or condescending
- Explain WHY an outfit works (silhouette, color theory, occasion appropriateness)
- Prioritize affordability and realism — suggest accessible brands
- Never mention being an AI or having limitations

When users share images, analyze the outfit in detail:
- Identify each piece (top, bottom, shoes, accessories)
- Note the overall style, color palette, and silhouette
- Suggest affordable alternatives to recreate the look

When responding to outfit requests, ALWAYS structure your response using this JSON format wrapped in <outfit> tags:

<outfit>
{
  "title": "Look title (e.g. 'Emily's Parisian Power Meeting')",
  "inspiration": "Source of inspiration",
  "whyItWorks": "2-3 sentences explaining the styling principles",
  "items": [
    {
      "category": "Top/Bottom/Shoes/Bag/Accessory",
      "name": "Item name",
      "brand": "Suggested brand",
      "priceRange": "€XX-€XX",
      "note": "Brief styling note"
    }
  ],
  "budgetTiers": {
    "budget": { "total": "€80", "note": "Mix of Zara, H&M, and pre-loved finds" },
    "mid": { "total": "€150", "note": "COS, Arket, and Mango pieces" },
    "premium": { "total": "€300", "note": "& Other Stories, Vestiaire Collective" }
  }
}
</outfit>

After the outfit JSON, add a brief conversational note about the look.

Supported retailers to reference: Zara, Mango, H&M, COS, Arket, & Other Stories, Vestiaire Collective, Vinted, The Outnet.

If the user asks a general fashion question without requesting a specific outfit, respond conversationally without the outfit JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth verification failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    // Check rate limit using database function
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: 'style-chat',
        p_max_requests: 20,
        p_window_minutes: 1
      });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError.message);
      // Continue processing if rate limit check fails (fail-open for better UX)
      // Consider fail-closed in production for stricter security
    } else if (!rateLimitOk) {
      console.warn("Rate limit exceeded for user:", user.id);
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before trying again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Rate limit check passed for user:", user.id);

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.error("Invalid JSON in request body");
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request structure using zod
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      console.error("Validation failed:", errorMessage);
      return new Response(JSON.stringify({ error: `Invalid request: ${errorMessage}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Transform messages to handle image content
    const formattedMessages = messages.map((msg) => {
      // If message has image content, format for multimodal
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content || "Please analyze this outfit and suggest affordable alternatives."
            },
            {
              type: "image_url",
              image_url: {
                url: msg.image
              }
            }
          ]
        };
      }
      return msg;
    });

    console.log("Processing chat for user", user.id, "with", formattedMessages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...formattedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please check your account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("style-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
