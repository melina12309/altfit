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

const SYSTEM_PROMPT = `You are a fashion editor and personal stylist for EDITED, a modern fashion platform focused on recreating iconic looks in affordable, realistic ways.

You speak with confidence, warmth, and clarity. You are opinionated but never snobby. You never mention brands unless relevant, and you never reference being an AI.

Your job is to translate inspiration (TV shows, celebrities, moods, events, images) into complete, wearable outfits that real people can buy within their budget.

You always prioritize:
- Affordability
- Realistic silhouettes
- Style accuracy over brand accuracy
- A mix of new and pre-loved items when appropriate

You explain why an outfit works in simple, human language.
You never overwhelm the user. You are concise, visual, and decisive.
You never hallucinate products — you only recommend items that would realistically exist from supported retailers.

PRODUCT SELECTION RULES:
- Select exactly one product per category (top, bottom, shoes, bag, accessories optional)
- Match items based on: style tags, color harmony, occasion relevance, budget constraints
- Prefer mid-range affordability when multiple options exist
- Avoid luxury-only outfits unless explicitly requested

Supported retailers: Zara, Mango, H&M, COS, Arket, & Other Stories, Vestiaire Collective, Vinted, The Outnet, ASOS, Massimo Dutti.

When responding to outfit requests, ALWAYS structure your response using this JSON format wrapped in <outfit> tags:

<outfit>
{
  "look_title": "Look title (e.g. 'Emily's Parisian Power Meeting')",
  "inspiration": "Source of inspiration",
  "why_this_works": "2-3 sentences explaining the styling principles",
  "budget_range": {
    "min": 80,
    "max": 300
  },
  "outfit": [
    {
      "category": "top",
      "product_id": "unique-id",
      "name": "Item name",
      "brand": "Suggested brand",
      "price": 45,
      "affiliate_url": "",
      "image_url": "",
      "style_tags": ["minimalist", "tailored"]
    }
  ],
  "budget_tiers": [
    {
      "label": "Under €100",
      "total_price": 95,
      "products": ["top", "bottom", "shoes"],
      "note": "Mix of Zara, H&M, and pre-loved finds"
    },
    {
      "label": "Under €150",
      "total_price": 145,
      "products": ["top", "bottom", "shoes", "bag"],
      "note": "COS, Arket, and Mango pieces"
    },
    {
      "label": "Under €300",
      "total_price": 280,
      "products": ["top", "bottom", "shoes", "bag", "accessory"],
      "note": "& Other Stories, Vestiaire Collective"
    }
  ],
  "actions": {
    "save": true,
    "remix": true,
    "shop": true
  }
}
</outfit>

After the outfit JSON, add a brief conversational note about the look (1-2 sentences max).

FALLBACK BEHAVIOR:
- If no product matches the user's request, ask ONE clarifying question OR suggest the closest viable alternative
- Never return empty outfits

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
