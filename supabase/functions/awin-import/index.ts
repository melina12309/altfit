import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AwinProduct {
  product_id: string;
  product_name: string;
  merchant_name: string;
  merchant_id: string;
  aw_deep_link: string;
  aw_image_url: string;
  search_price: string;
  currency: string;
  category_name?: string;
  brand_name?: string;
  colour?: string;
  custom_1?: string; // Often used for gender
  custom_2?: string; // Often used for style tags
  description?: string;
}

// Map AWIN categories to our internal categories
function mapCategory(categoryName: string): string {
  const lower = categoryName?.toLowerCase() || "";
  
  if (lower.includes("top") || lower.includes("shirt") || lower.includes("blouse") || lower.includes("t-shirt") || lower.includes("sweater") || lower.includes("jumper")) {
    return "tops";
  }
  if (lower.includes("trouser") || lower.includes("pant") || lower.includes("jean") || lower.includes("skirt") || lower.includes("short")) {
    return "bottoms";
  }
  if (lower.includes("shoe") || lower.includes("boot") || lower.includes("sneaker") || lower.includes("sandal") || lower.includes("heel") || lower.includes("loafer")) {
    return "shoes";
  }
  if (lower.includes("jacket") || lower.includes("coat") || lower.includes("blazer") || lower.includes("cardigan") || lower.includes("outerwear")) {
    return "outerwear";
  }
  if (lower.includes("bag") || lower.includes("accessory") || lower.includes("accessories") || lower.includes("hat") || lower.includes("scarf") || lower.includes("belt") || lower.includes("jewel") || lower.includes("watch") || lower.includes("sunglasses")) {
    return "accessories";
  }
  if (lower.includes("dress")) {
    return "dresses";
  }
  
  return "other";
}

// Map gender from AWIN data
function mapGender(genderField: string | undefined): string {
  const lower = genderField?.toLowerCase() || "";
  
  if (lower.includes("women") || lower.includes("female") || lower.includes("ladies")) {
    return "women";
  }
  if (lower.includes("men") || lower.includes("male") && !lower.includes("women")) {
    return "men";
  }
  
  return "unisex";
}

// Parse style tags from product data
function parseStyleTags(product: AwinProduct): string[] {
  const tags: string[] = [];
  const text = `${product.product_name} ${product.description || ""} ${product.custom_2 || ""}`.toLowerCase();
  
  const styleMappings: Record<string, string[]> = {
    "minimalist": ["minimal", "simple", "clean", "basic"],
    "casual": ["casual", "everyday", "relaxed", "comfort"],
    "formal": ["formal", "office", "business", "professional", "work"],
    "vintage": ["vintage", "retro", "classic", "timeless"],
    "streetwear": ["street", "urban", "sporty", "athletic"],
    "bohemian": ["boho", "bohemian", "flowy", "hippie"],
    "elegant": ["elegant", "chic", "sophisticated", "luxe"],
    "edgy": ["edgy", "punk", "rock", "leather"],
    "preppy": ["preppy", "classic", "collegiate", "nautical"],
    "romantic": ["romantic", "feminine", "floral", "lace"],
  };
  
  for (const [tag, keywords] of Object.entries(styleMappings)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags : ["casual"];
}

// Parse colors from product data
function parseColors(product: AwinProduct): string[] {
  const colors: string[] = [];
  const colorField = product.colour?.toLowerCase() || "";
  const text = `${product.product_name} ${colorField}`.toLowerCase();
  
  const colorKeywords = [
    "black", "white", "grey", "gray", "navy", "blue", "red", "green", 
    "brown", "beige", "cream", "pink", "purple", "orange", "yellow",
    "burgundy", "olive", "tan", "camel", "khaki", "coral", "teal"
  ];
  
  for (const color of colorKeywords) {
    if (text.includes(color)) {
      colors.push(color);
    }
  }
  
  return colors;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AWIN_API_TOKEN = Deno.env.get("AWIN_API_TOKEN");
    const AWIN_PUBLISHER_ID = Deno.env.get("AWIN_PUBLISHER_ID");
    
    if (!AWIN_API_TOKEN || !AWIN_PUBLISHER_ID) {
      throw new Error("AWIN credentials not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body for optional parameters
    let feedIds: string[] = [];
    let limit = 500;
    
    try {
      const body = await req.json();
      feedIds = body.feedIds || [];
      limit = body.limit || 500;
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log("Starting AWIN product import...");
    console.log(`Publisher ID: ${AWIN_PUBLISHER_ID}`);
    console.log(`Feed IDs: ${feedIds.length > 0 ? feedIds.join(", ") : "all"}`);
    console.log(`Limit: ${limit}`);

    // AWIN Product Feed API endpoint
    // Format: https://productdata.awin.com/datafeed/download/apikey/{apikey}/language/en/fid/{feedId}/columns/...
    // If no specific feed IDs, we'll fetch from the advertiser list first
    
    let allProducts: AwinProduct[] = [];
    
    // If specific feed IDs provided, fetch from those
    if (feedIds.length > 0) {
      for (const feedId of feedIds) {
        try {
          const feedUrl = `https://productdata.awin.com/datafeed/download/apikey/${AWIN_API_TOKEN}/language/en/fid/${feedId}/format/json/columns/product_id,product_name,merchant_name,merchant_id,aw_deep_link,aw_image_url,search_price,currency,category_name,brand_name,colour,custom_1,custom_2,description/`;
          
          console.log(`Fetching feed ${feedId}...`);
          
          const feedResponse = await fetch(feedUrl);
          
          if (!feedResponse.ok) {
            console.error(`Failed to fetch feed ${feedId}: ${feedResponse.status}`);
            continue;
          }
          
          const feedData = await feedResponse.json();
          
          if (Array.isArray(feedData)) {
            allProducts = allProducts.concat(feedData.slice(0, limit));
          }
          
          console.log(`Fetched ${feedData.length || 0} products from feed ${feedId}`);
        } catch (feedError) {
          console.error(`Error fetching feed ${feedId}:`, feedError);
        }
      }
    } else {
      // Try to fetch from AWIN's API to get available advertisers/feeds
      // This is a simplified approach - in production you'd want to maintain a list of feed IDs
      console.log("No specific feed IDs provided. Please provide feedIds in the request body.");
      console.log("Example: { \"feedIds\": [\"12345\", \"67890\"], \"limit\": 100 }");
      
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please provide feedIds array in request body. Get your feed IDs from the AWIN Publisher Dashboard.",
          example: { feedIds: ["12345", "67890"], limit: 100 }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (allProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No products found in the specified feeds",
          imported: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${allProducts.length} products for import...`);

    // Transform and upsert products
    let imported = 0;
    let errors = 0;
    const batchSize = 50;
    
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      
      const transformedProducts = batch.map((product) => ({
        provider: "awin_feed",
        provider_product_id: product.product_id,
        title: product.product_name,
        brand: product.brand_name || product.merchant_name,
        retailer: product.merchant_name,
        price: parseFloat(product.search_price) || 0,
        currency: product.currency || "EUR",
        category: mapCategory(product.category_name || ""),
        gender: mapGender(product.custom_1),
        image_url: product.aw_image_url,
        affiliate_url: product.aw_deep_link,
        style_tags: parseStyleTags(product),
        colors: parseColors(product),
        last_seen_at: new Date().toISOString(),
      }));

      // Upsert to handle duplicates
      const { error: upsertError } = await supabase
        .from("products")
        .upsert(transformedProducts, {
          onConflict: "provider,provider_product_id",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error(`Batch upsert error:`, upsertError);
        errors += batch.length;
      } else {
        imported += batch.length;
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${imported} imported, ${errors} errors`);
    }

    console.log(`Import complete: ${imported} products imported, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${imported} products`,
        imported,
        errors,
        total: allProducts.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("awin-import error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
