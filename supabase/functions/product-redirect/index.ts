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
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    const sessionId = url.searchParams.get("sessionId") || crypto.randomUUID();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Product redirect request:", { productId, sessionId });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use service role to bypass RLS for clicks
    );

    // Get the product's affiliate URL
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("affiliate_url, provider")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user ID from auth header if present
    let userId = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await anonClient.auth.getUser();
      userId = user?.id || null;
    }

    // Log the click
    const { error: clickError } = await supabase.from("clicks").insert({
      product_id: productId,
      provider: product.provider,
      session_id: sessionId,
      user_id: userId,
    });

    if (clickError) {
      console.error("Failed to log click:", clickError);
      // Continue anyway - don't block the redirect
    }

    console.log("Click logged, redirecting to:", product.affiliate_url);

    // Redirect to affiliate URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: product.affiliate_url,
      },
    });
  } catch (error) {
    console.error("product-redirect error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
