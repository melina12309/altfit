import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AwinCsvProduct {
  aw_deep_link: string;
  product_name: string;
  aw_product_id: string;
  merchant_product_id: string;
  merchant_image_url: string;
  description: string;
  merchant_category: string;
  search_price: string;
  merchant_name: string;
  merchant_id: string;
  category_name: string;
  category_id: string;
  aw_image_url: string;
  currency: string;
  store_price: string;
  delivery_cost: string;
  merchant_deep_link: string;
  language: string;
  last_updated: string;
  display_price: string;
  data_feed_id: string;
  brand_name: string;
  rrp_price: string;
  in_stock: string;
  is_for_sale: string;
  merchant_thumb_url: string;
  alternate_image: string;
  alternate_image_two: string;
  alternate_image_four: string;
  alternate_image_three: string;
}

// Map AWIN categories to our internal categories
function mapCategory(categoryName: string): string {
  const lower = categoryName?.toLowerCase() || "";
  
  if (lower.includes("top") || lower.includes("shirt") || lower.includes("blouse") || lower.includes("t-shirt") || lower.includes("sweater") || lower.includes("jumper") || lower.includes("polo") || lower.includes("vest")) {
    return "tops";
  }
  if (lower.includes("trouser") || lower.includes("pant") || lower.includes("jean") || lower.includes("skirt") || lower.includes("short") || lower.includes("legging")) {
    return "bottoms";
  }
  if (lower.includes("shoe") || lower.includes("boot") || lower.includes("sneaker") || lower.includes("sandal") || lower.includes("heel") || lower.includes("loafer") || lower.includes("trainer") || lower.includes("footwear")) {
    return "shoes";
  }
  if (lower.includes("jacket") || lower.includes("coat") || lower.includes("blazer") || lower.includes("cardigan") || lower.includes("outerwear") || lower.includes("hoodie") || lower.includes("parka")) {
    return "outerwear";
  }
  if (lower.includes("bag") || lower.includes("accessory") || lower.includes("accessories") || lower.includes("hat") || lower.includes("scarf") || lower.includes("belt") || lower.includes("jewel") || lower.includes("watch") || lower.includes("sunglasses") || lower.includes("wallet") || lower.includes("glove")) {
    return "accessories";
  }
  if (lower.includes("dress")) {
    return "dresses";
  }
  
  return "other";
}

// Map gender from AWIN category/product data
function mapGender(categoryName: string, productName: string): string {
  const text = `${categoryName} ${productName}`.toLowerCase();
  
  if (text.includes("women") || text.includes("woman") || text.includes("female") || text.includes("ladies") || text.includes("girl")) {
    return "women";
  }
  if ((text.includes("men") || text.includes("male") || text.includes("boy")) && !text.includes("women")) {
    return "men";
  }
  
  return "unisex";
}

// Parse style tags from product data
function parseStyleTags(productName: string, description: string, categoryName: string): string[] {
  const tags: string[] = [];
  const text = `${productName} ${description || ""} ${categoryName || ""}`.toLowerCase();
  
  const styleMappings: Record<string, string[]> = {
    "minimalist": ["minimal", "simple", "clean", "basic"],
    "casual": ["casual", "everyday", "relaxed", "comfort", "weekend"],
    "formal": ["formal", "office", "business", "professional", "work", "suit"],
    "vintage": ["vintage", "retro", "classic", "timeless"],
    "streetwear": ["street", "urban", "sporty", "athletic", "sport"],
    "bohemian": ["boho", "bohemian", "flowy", "hippie"],
    "elegant": ["elegant", "chic", "sophisticated", "luxe", "luxury"],
    "edgy": ["edgy", "punk", "rock", "leather", "biker"],
    "preppy": ["preppy", "classic", "collegiate", "nautical", "polo"],
    "romantic": ["romantic", "feminine", "floral", "lace", "ruffle"],
  };
  
  for (const [tag, keywords] of Object.entries(styleMappings)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags : ["casual"];
}

// Parse colors from product data
function parseColors(productName: string, description: string): string[] {
  const colors: string[] = [];
  const text = `${productName} ${description || ""}`.toLowerCase();
  
  const colorKeywords = [
    "black", "white", "grey", "gray", "navy", "blue", "red", "green", 
    "brown", "beige", "cream", "pink", "purple", "orange", "yellow",
    "burgundy", "olive", "tan", "camel", "khaki", "coral", "teal",
    "silver", "gold", "nude", "charcoal", "ivory", "indigo", "maroon"
  ];
  
  for (const color of colorKeywords) {
    if (text.includes(color)) {
      colors.push(color);
    }
  }
  
  return colors;
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body for optional parameters
    let datafeedUrl = "";
    let limit = 1000;
    let offset = 0;
    
    try {
      const body = await req.json();
      datafeedUrl = body.datafeedUrl || "";
      limit = body.limit || 1000;
      offset = body.offset || 0;
    } catch {
      // No body or invalid JSON
    }

    // Default datafeed URL from user's AWIN setup
    if (!datafeedUrl) {
      datafeedUrl = "https://productdata.awin.com/datafeed/download/apikey/b0a6142471b0ec84e434511a422c3174/language/en/fid/87443,88034,96910,105062,107946,109551,109975/bid/64319,65287,63237,64837,51343,64737,65353,51569,51639,63251,64401,51707,64727,64579,51959,63269,52213,63279,64323,53433,53811,65873,64759,66075,54633,64663,64329,63815,63355,66329,56141,66413,56281,64617,63377,63961,56867,56959,66603,63381,66683,64991,63383,66743,57757,64619,64339,58789,67137,63435,64605,63451,67199,59223,63459,67293,67437,67481,63861,63503,67695,63517,67807,64325,64653,62427,63529,62437,63849,62617,68835,68901,69181,69365,69529,69635,69795,69945,70145,70219,70863,71319,71459,71477,71485,71549,71661,71771,73239,74449,75497,79801,79879,81787,81987,82019,82089,82283,83039,84691/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id,brand_name,rrp_price,in_stock,is_for_sale,merchant_thumb_url,alternate_image,alternate_image_two,alternate_image_four,alternate_image_three/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/";
    }

    console.log("Starting AWIN datafeed import...");
    console.log(`Limit: ${limit}, Offset: ${offset}`);
    console.log(`URL: ${datafeedUrl.substring(0, 100)}...`);

    // Fetch the gzipped CSV datafeed
    console.log("Fetching datafeed...");
    const response = await fetch(datafeedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch datafeed: ${response.status} ${response.statusText}`);
    }

    // Get the gzipped data
    const gzippedData = new Uint8Array(await response.arrayBuffer());
    console.log(`Downloaded ${gzippedData.length} bytes of gzipped data`);

    // Decompress
    console.log("Decompressing data...");
    const decompressedData = gunzip(gzippedData);
    const csvContent = new TextDecoder().decode(decompressedData);
    console.log(`Decompressed to ${csvContent.length} characters`);

    // Parse CSV
    const lines = csvContent.split("\n").filter(line => line.trim());
    console.log(`Found ${lines.length} lines in CSV`);

    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log(`Headers: ${headers.join(", ")}`);

    // Create header index map
    const headerIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerIndex[h.trim()] = i;
    });

    // Parse products (skip header, apply offset and limit)
    const startRow = 1 + offset; // Skip header + offset
    const endRow = Math.min(lines.length - 1, offset + limit);
    const totalAvailable = lines.length - 1;
    console.log(`Processing products ${offset + 1} to ${endRow} of ${totalAvailable} total...`);

    const products: AwinCsvProduct[] = [];
    for (let i = startRow; i <= endRow; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        const product: AwinCsvProduct = {
          aw_deep_link: values[headerIndex["aw_deep_link"]] || "",
          product_name: values[headerIndex["product_name"]] || "",
          aw_product_id: values[headerIndex["aw_product_id"]] || "",
          merchant_product_id: values[headerIndex["merchant_product_id"]] || "",
          merchant_image_url: values[headerIndex["merchant_image_url"]] || "",
          description: values[headerIndex["description"]] || "",
          merchant_category: values[headerIndex["merchant_category"]] || "",
          search_price: values[headerIndex["search_price"]] || "0",
          merchant_name: values[headerIndex["merchant_name"]] || "",
          merchant_id: values[headerIndex["merchant_id"]] || "",
          category_name: values[headerIndex["category_name"]] || "",
          category_id: values[headerIndex["category_id"]] || "",
          aw_image_url: values[headerIndex["aw_image_url"]] || "",
          currency: values[headerIndex["currency"]] || "EUR",
          store_price: values[headerIndex["store_price"]] || "",
          delivery_cost: values[headerIndex["delivery_cost"]] || "",
          merchant_deep_link: values[headerIndex["merchant_deep_link"]] || "",
          language: values[headerIndex["language"]] || "",
          last_updated: values[headerIndex["last_updated"]] || "",
          display_price: values[headerIndex["display_price"]] || "",
          data_feed_id: values[headerIndex["data_feed_id"]] || "",
          brand_name: values[headerIndex["brand_name"]] || "",
          rrp_price: values[headerIndex["rrp_price"]] || "",
          in_stock: values[headerIndex["in_stock"]] || "",
          is_for_sale: values[headerIndex["is_for_sale"]] || "",
          merchant_thumb_url: values[headerIndex["merchant_thumb_url"]] || "",
          alternate_image: values[headerIndex["alternate_image"]] || "",
          alternate_image_two: values[headerIndex["alternate_image_two"]] || "",
          alternate_image_four: values[headerIndex["alternate_image_four"]] || "",
          alternate_image_three: values[headerIndex["alternate_image_three"]] || "",
        };

        // Skip invalid products
        if (product.aw_product_id && product.product_name && product.aw_deep_link) {
          products.push(product);
        }
      } catch (parseError) {
        console.error(`Error parsing line ${i}:`, parseError);
      }
    }

    console.log(`Parsed ${products.length} valid products`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No valid products found in datafeed",
          imported: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Transform and upsert products in batches
    let imported = 0;
    let errors = 0;
    const batchSize = 100;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const transformedProducts = batch.map((product) => ({
        provider: "awin_feed",
        provider_product_id: product.aw_product_id,
        title: product.product_name,
        brand: product.brand_name || product.merchant_name,
        retailer: product.merchant_name,
        price: parseFloat(product.search_price) || 0,
        currency: product.currency || "EUR",
        category: mapCategory(product.category_name || product.merchant_category),
        gender: mapGender(product.category_name || product.merchant_category, product.product_name),
        image_url: product.aw_image_url || product.merchant_image_url,
        affiliate_url: product.aw_deep_link,
        style_tags: parseStyleTags(product.product_name, product.description, product.category_name),
        colors: parseColors(product.product_name, product.description),
        last_seen_at: new Date().toISOString(),
      }));

      // Filter out products with no price or image
      const validProducts = transformedProducts.filter(p => p.price > 0 && p.image_url);

      if (validProducts.length > 0) {
        const { error: upsertError } = await supabase
          .from("products")
          .upsert(validProducts, {
            onConflict: "provider,provider_product_id",
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error(`Batch upsert error:`, upsertError);
          errors += validProducts.length;
        } else {
          imported += validProducts.length;
        }
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${imported} imported, ${errors} errors`);
    }

    console.log(`Import complete: ${imported} products imported, ${errors} errors`);

    const totalAvailableProducts = lines.length - 1;
    const hasMore = offset + limit < totalAvailableProducts;
    const nextOffset = hasMore ? offset + limit : null;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${imported} products (${offset + 1}-${Math.min(offset + limit, totalAvailableProducts)} of ${totalAvailableProducts})`,
        imported,
        errors,
        total: products.length,
        totalAvailable: totalAvailableProducts,
        offset,
        limit,
        hasMore,
        nextOffset,
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
