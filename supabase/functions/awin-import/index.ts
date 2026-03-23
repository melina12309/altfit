import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PUBLISHER_ID = "2703836";
const API_KEY = "b0a6142471b0ec84e434511a422c3174";
const FEED_LIST_URL = `https://ui.awin.com/productdata-darwin-download/publisher/${PUBLISHER_ID}/${API_KEY}/1/feedList`;

// Map category from Google Shopping or AWIN category fields
function mapCategory(categoryName: string, productType: string, title: string): string {
  const text = `${categoryName} ${productType} ${title}`.toLowerCase();

  if (text.includes("dress") && !text.includes("dresser")) return "dresses";
  if (text.includes("top") || text.includes("shirt") || text.includes("blouse") || text.includes("t-shirt") || text.includes("sweater") || text.includes("jumper") || text.includes("polo") || text.includes("vest") || text.includes("tee") || text.includes("tank") || text.includes("camisole") || text.includes("bodysuit")) return "tops";
  if (text.includes("trouser") || text.includes("pant") || text.includes("jean") || text.includes("skirt") || text.includes("short") || text.includes("legging") || text.includes("jogger") || text.includes("chino")) return "bottoms";
  if (text.includes("shoe") || text.includes("boot") || text.includes("sneaker") || text.includes("sandal") || text.includes("heel") || text.includes("loafer") || text.includes("trainer") || text.includes("footwear") || text.includes("slipper") || text.includes("mule") || text.includes("pump") || text.includes("espadrille")) return "shoes";
  if (text.includes("jacket") || text.includes("coat") || text.includes("blazer") || text.includes("cardigan") || text.includes("outerwear") || text.includes("hoodie") || text.includes("parka") || text.includes("gilet") || text.includes("windbreaker") || text.includes("trench") || text.includes("puffer")) return "outerwear";
  if (text.includes("bag") || text.includes("accessor") || text.includes("hat") || text.includes("scarf") || text.includes("belt") || text.includes("jewel") || text.includes("watch") || text.includes("sunglasses") || text.includes("wallet") || text.includes("glove") || text.includes("earring") || text.includes("necklace") || text.includes("bracelet") || text.includes("ring") || text.includes("pendant") || text.includes("chain") || text.includes("charm")) return "accessories";

  return "other";
}

// Map gender from available fields
function mapGender(gender: string, categoryName: string, title: string): string {
  // Google Shopping feeds have a dedicated gender field
  const g = (gender || "").toLowerCase().trim();
  if (g === "female" || g === "women" || g === "woman") return "women";
  if (g === "male" || g === "men" || g === "man") return "men";
  if (g === "unisex") return "unisex";

  // Fallback to text matching
  const text = `${categoryName} ${title}`.toLowerCase();
  if (text.includes("women") || text.includes("woman") || text.includes("female") || text.includes("ladies") || text.includes("girl")) return "women";
  if ((text.includes("men") || text.includes("male") || text.includes("boy")) && !text.includes("women")) return "men";

  return "unisex";
}

// Parse style tags from product data
function parseStyleTags(title: string, description: string, categoryName: string): string[] {
  const tags: string[] = [];
  const text = `${title} ${description || ""} ${categoryName || ""}`.toLowerCase();

  const styleMappings: Record<string, string[]> = {
    "minimalist": ["minimal", "simple", "clean", "basic"],
    "casual": ["casual", "everyday", "relaxed", "comfort", "weekend"],
    "formal": ["formal", "office", "business", "professional", "work", "suit"],
    "vintage": ["vintage", "retro", "classic", "timeless"],
    "streetwear": ["street", "urban", "sporty", "athletic", "sport"],
    "bohemian": ["boho", "bohemian", "flowy", "hippie"],
    "elegant": ["elegant", "chic", "sophisticated", "luxe", "luxury"],
    "edgy": ["edgy", "punk", "rock", "leather", "biker"],
    "preppy": ["preppy", "collegiate", "nautical"],
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
function parseColors(title: string, description: string, color: string): string[] {
  const colors: string[] = [];
  const text = `${color || ""} ${title} ${description || ""}`.toLowerCase();

  const colorKeywords = [
    "black", "white", "grey", "gray", "navy", "blue", "red", "green",
    "brown", "beige", "cream", "pink", "purple", "orange", "yellow",
    "burgundy", "olive", "tan", "camel", "khaki", "coral", "teal",
    "silver", "gold", "nude", "charcoal", "ivory", "indigo", "maroon",
    "rose", "lilac", "mint", "sage", "rust", "terracotta", "copper",
  ];

  for (const c of colorKeywords) {
    if (text.includes(c)) {
      colors.push(c);
    }
  }

  return colors;
}

// Parse price from various formats: "98.00 EUR", "98.00", "EUR 98.00"
function parsePrice(priceStr: string): { price: number; currency: string } {
  if (!priceStr) return { price: 0, currency: "EUR" };

  const cleaned = priceStr.trim();
  // Match number and optional currency
  const match = cleaned.match(/([A-Z]{3})?\s*([\d,.]+)\s*([A-Z]{3})?/);
  if (!match) return { price: 0, currency: "EUR" };

  const currency = match[1] || match[3] || "EUR";
  const priceNum = parseFloat(match[2].replace(",", ".")) || 0;

  return { price: priceNum, currency };
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

// Fetch and parse a single feed
async function fetchFeed(feedUrl: string, limit: number): Promise<Record<string, string>[]> {
  console.log(`Fetching feed: ${feedUrl.substring(0, 80)}...`);
  const response = await fetch(feedUrl);

  if (!response.ok) {
    throw new Error(`Feed fetch failed: ${response.status} ${response.statusText}`);
  }

  const gzippedData = new Uint8Array(await response.arrayBuffer());
  console.log(`Downloaded ${gzippedData.length} bytes`);

  const decompressedData = gunzip(gzippedData);
  // Handle BOM
  let csvContent = new TextDecoder().decode(decompressedData);
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.slice(1);
  }

  const lines = csvContent.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  console.log(`Feed headers: ${headers.slice(0, 10).join(", ")}...`);

  const rows: Record<string, string>[] = [];
  const maxRows = Math.min(lines.length, limit + 1); // +1 for header

  for (let i = 1; i < maxRows; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      rows.push(row);
    } catch {
      // Skip malformed rows
    }
  }

  return rows;
}

// Transform a row (from either feed format) into a product for upsert
function transformRow(row: Record<string, string>): Record<string, unknown> | null {
  // Google Shopping format fields
  const title = row["title"] || row["product_name"] || "";
  const id = row["id"] || row["aw_product_id"] || "";
  const awDeepLink = row["aw_deep_link"] || row["aw_mobile_link"] || "";
  const imageUrl = row["image_link"] || row["aw_image_url"] || row["merchant_image_url"] || "";
  const description = row["description"] || "";
  const brand = row["brand"] || row["brand_name"] || row["advertiser_name"] || "";
  const retailer = row["advertiser_name"] || row["merchant_name"] || brand;
  const priceRaw = row["price"] || row["search_price"] || row["sale_price"] || "0";
  const category = row["google_product_category"] || row["product_type"] || row["category_name"] || row["merchant_category"] || "";
  const gender = row["gender"] || "";
  const color = row["color"] || row["colour"] || "";
  const availability = row["availability"] || row["in_stock"] || "";
  const condition = row["condition"] || "";

  // Skip invalid products
  if (!id || !title || !awDeepLink || !imageUrl) return null;

  // Skip out of stock
  if (availability && availability !== "in_stock" && availability !== "1" && availability !== "yes") return null;

  // Skip used/refurbished
  if (condition && condition !== "new" && condition !== "") return null;

  const { price, currency } = parsePrice(priceRaw);
  if (price <= 0) return null;

  const mappedCategory = mapCategory(category, row["product_type"] || "", title);
  const mappedGender = mapGender(gender, category, title);

  return {
    provider: "awin_feed",
    provider_product_id: id,
    title: title.substring(0, 500),
    brand: brand.substring(0, 200),
    retailer: retailer.substring(0, 200),
    price,
    currency,
    category: mappedCategory,
    gender: mappedGender,
    image_url: imageUrl,
    affiliate_url: awDeepLink,
    style_tags: parseStyleTags(title, description, category),
    colors: parseColors(title, description, color),
    last_seen_at: new Date().toISOString(),
    is_active: true,
  };
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

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "import";
    const limitParam = parseInt(url.searchParams.get("limit") || "2000");
    const feedIds = url.searchParams.get("feeds")?.split(",") || [];

    // Action: list — return available feeds with fashion filter
    if (action === "list") {
      console.log("Fetching feed list...");
      const response = await fetch(FEED_LIST_URL);
      if (!response.ok) throw new Error(`Feed list fetch failed: ${response.status}`);

      const csvContent = await response.text();
      const lines = csvContent.split("\n").filter(l => l.trim());
      const headers = parseCSVLine(lines[0]);

      const feeds: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const feed: Record<string, string> = {};
        headers.forEach((h, idx) => {
          feed[h.trim()] = values[idx] || "";
        });

        // Only include fashion-relevant or active feeds
        const vertical = (feed["Vertical"] || "").toLowerCase();
        const name = (feed["Advertiser Name"] || "").toLowerCase();
        const feedName = (feed["Feed Name"] || "").toLowerCase();
        const status = feed["Membership Status"] || "";
        const isFashion = vertical.includes("fashion") ||
          name.includes("cloth") || name.includes("fashion") || name.includes("wear") ||
          name.includes("style") || name.includes("shoe") || name.includes("jewel") ||
          feedName.includes("cloth") || feedName.includes("fashion");

        if (status === "active" || isFashion) {
          feeds.push({
            advertiser_id: feed["Advertiser ID"],
            advertiser_name: feed["Advertiser Name"],
            region: feed["Primary Region"],
            status,
            feed_id: feed["Feed ID"],
            feed_name: feed["Feed Name"],
            language: feed["Language"],
            vertical: feed["Vertical"],
            products: feed["No of products"],
            url: feed["URL"],
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, feeds, total: feeds.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: import — import products from specific feeds or all active feeds
    console.log("Starting AWIN feed import...");

    // If no specific feeds requested, fetch the feed list and pick active ones
    let feedUrls: { id: string; url: string; name: string }[] = [];

    if (feedIds.length > 0) {
      // Import specific feed IDs
      feedUrls = feedIds.map(id => ({
        id,
        url: `https://ui.awin.com/productdata-darwin-download/publisher/${PUBLISHER_ID}/${API_KEY}/1/feed/${id}.csv.gz`,
        name: id,
      }));
    } else {
      // Fetch feed list and import all active feeds
      console.log("Fetching feed list to find active feeds...");
      const listResponse = await fetch(FEED_LIST_URL);
      if (!listResponse.ok) throw new Error(`Feed list fetch failed: ${listResponse.status}`);

      const csvContent = await listResponse.text();
      const lines = csvContent.split("\n").filter(l => l.trim());
      const headers = parseCSVLine(lines[0]);

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const feed: Record<string, string> = {};
        headers.forEach((h, idx) => {
          feed[h.trim()] = values[idx] || "";
        });

        if (feed["Membership Status"] === "active" && feed["URL"]) {
          feedUrls.push({
            id: feed["Feed ID"],
            url: feed["URL"],
            name: feed["Advertiser Name"],
          });
        }
      }

      console.log(`Found ${feedUrls.length} active feeds`);
    }

    if (feedUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No feeds to import. Join advertiser programs on AWIN first, or specify feed IDs with ?feeds=F1400,F295",
          imported: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalImported = 0;
    let totalErrors = 0;
    const feedResults: Record<string, unknown>[] = [];

    for (const feed of feedUrls) {
      try {
        console.log(`\nImporting feed ${feed.id} (${feed.name})...`);
        const rows = await fetchFeed(feed.url, limitParam);
        console.log(`Parsed ${rows.length} rows from ${feed.name}`);

        // Transform rows to products
        const products = rows
          .map(transformRow)
          .filter((p): p is Record<string, unknown> => p !== null);

        console.log(`${products.length} valid products from ${feed.name}`);

        // Upsert in batches
        let feedImported = 0;
        let feedErrors = 0;
        const batchSize = 100;

        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize);

          const { error: upsertError } = await supabase
            .from("products")
            .upsert(batch, {
              onConflict: "provider,provider_product_id",
              ignoreDuplicates: false,
            });

          if (upsertError) {
            console.error(`Batch error for ${feed.name}:`, upsertError.message);
            feedErrors += batch.length;
          } else {
            feedImported += batch.length;
          }
        }

        totalImported += feedImported;
        totalErrors += feedErrors;

        feedResults.push({
          feed_id: feed.id,
          advertiser: feed.name,
          parsed: rows.length,
          imported: feedImported,
          errors: feedErrors,
        });

        console.log(`Feed ${feed.name}: ${feedImported} imported, ${feedErrors} errors`);
      } catch (feedError) {
        console.error(`Failed to import feed ${feed.id} (${feed.name}):`, feedError);
        feedResults.push({
          feed_id: feed.id,
          advertiser: feed.name,
          error: feedError instanceof Error ? feedError.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${totalImported} products from ${feedUrls.length} feeds`,
        totalImported,
        totalErrors,
        feeds: feedResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
