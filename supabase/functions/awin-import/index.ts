import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PUBLISHER_ID = "2703836";
const API_KEY = "b0a6142471b0ec84e434511a422c3174";
const FEED_LIST_URL = `https://ui.awin.com/productdata-darwin-download/publisher/${PUBLISHER_ID}/${API_KEY}/1/feedList`;

// ── Helpers ──────────────────────────────────────────────────

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

function mapGender(gender: string, categoryName: string, title: string): string {
  const g = (gender || "").toLowerCase().trim();
  if (g === "female" || g === "women" || g === "woman") return "women";
  if (g === "male" || g === "men" || g === "man") return "men";
  if (g === "unisex") return "unisex";
  const text = `${categoryName} ${title}`.toLowerCase();
  if (text.includes("women") || text.includes("woman") || text.includes("female") || text.includes("ladies") || text.includes("girl")) return "women";
  if ((text.includes("men") || text.includes("male") || text.includes("boy")) && !text.includes("women")) return "men";
  return "unisex";
}

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
    if (keywords.some(kw => text.includes(kw))) tags.push(tag);
  }
  return tags.length > 0 ? tags : ["casual"];
}

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
    if (text.includes(c)) colors.push(c);
  }
  return colors;
}

function parsePrice(priceStr: string): { price: number; currency: string } {
  if (!priceStr) return { price: 0, currency: "EUR" };
  const match = priceStr.trim().match(/([A-Z]{3})?\s*([\d,.]+)\s*([A-Z]{3})?/);
  if (!match) return { price: 0, currency: "EUR" };
  return { price: parseFloat(match[2].replace(",", ".")) || 0, currency: match[1] || match[3] || "EUR" };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function transformRow(row: Record<string, string>): Record<string, unknown> | null {
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

  if (!id || !title || !awDeepLink || !imageUrl) return null;
  if (availability && availability !== "in_stock" && availability !== "1" && availability !== "yes") return null;
  if (condition && condition !== "new" && condition !== "") return null;

  const { price, currency } = parsePrice(priceRaw);
  if (price <= 0) return null;

  return {
    provider: "awin_feed",
    provider_product_id: id,
    title: title.substring(0, 500),
    brand: brand.substring(0, 200),
    retailer: retailer.substring(0, 200),
    price, currency,
    category: mapCategory(category, row["product_type"] || "", title),
    gender: mapGender(gender, category, title),
    image_url: imageUrl,
    affiliate_url: awDeepLink,
    style_tags: parseStyleTags(title, description, category),
    colors: parseColors(title, description, color),
    last_seen_at: new Date().toISOString(),
    is_active: true,
  };
}

// ── Streaming feed processor ────────────────────────────────
// Instead of decompressing the entire gzip into memory, we now
// use DecompressionStream to stream the CSV and process line-by-line.

async function processFeedStreaming(
  feedUrl: string,
  limit: number,
  supabase: ReturnType<typeof createClient>,
): Promise<{ parsed: number; imported: number; errors: number }> {
  console.log(`Fetching feed: ${feedUrl.substring(0, 80)}...`);
  const response = await fetch(feedUrl);
  if (!response.ok) throw new Error(`Feed fetch failed: ${response.status}`);
  if (!response.body) throw new Error("No response body");

  // Stream-decompress gzip
  const decompressedStream = response.body.pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressedStream.pipeThrough(new TextDecoderStream()).getReader();

  let headers: string[] | null = null;
  let leftover = "";
  let parsed = 0;
  let imported = 0;
  let errors = 0;
  let batch: Record<string, unknown>[] = [];
  const BATCH_SIZE = 100;
  let bomStripped = false;

  async function flushBatch() {
    if (batch.length === 0) return;
    const toUpsert = batch.splice(0);
    const { error } = await supabase
      .from("products")
      .upsert(toUpsert, { onConflict: "provider,provider_product_id", ignoreDuplicates: false });
    if (error) {
      console.error("Batch upsert error:", error.message);
      errors += toUpsert.length;
    } else {
      imported += toUpsert.length;
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    let chunk = leftover + value;

    // Strip BOM from very first chunk
    if (!bomStripped) {
      if (chunk.charCodeAt(0) === 0xFEFF) chunk = chunk.slice(1);
      bomStripped = true;
    }

    const lines = chunk.split("\n");
    // Last element may be incomplete – save for next iteration
    leftover = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (!headers) {
        headers = parseCSVLine(trimmed).map(h => h.trim().toLowerCase());
        console.log(`Headers: ${headers.slice(0, 8).join(", ")}...`);
        continue;
      }

      if (parsed >= limit) break;

      try {
        const values = parseCSVLine(trimmed);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const product = transformRow(row);
        if (product) {
          batch.push(product);
          parsed++;

          if (batch.length >= BATCH_SIZE) {
            await flushBatch();
          }
        }
      } catch {
        // skip malformed rows
      }
    }

    if (parsed >= limit) break;
  }

  // Process any remaining leftover line
  if (leftover.trim() && headers && parsed < limit) {
    try {
      const values = parseCSVLine(leftover.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      const product = transformRow(row);
      if (product) { batch.push(product); parsed++; }
    } catch { /* skip */ }
  }

  // Final flush
  await flushBatch();

  return { parsed, imported, errors };
}

// ── Main handler ────────────────────────────────────────────

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
    const limitParam = parseInt(url.searchParams.get("limit") || "1000");
    const feedIds = url.searchParams.get("feeds")?.split(",").filter(Boolean) || [];

    // ── Action: list ──
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
        headers.forEach((h, idx) => { feed[h.trim()] = values[idx] || ""; });

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

    // ── Action: import (one feed at a time) ──
    // IMPORTANT: To stay within memory limits, import ONE feed per invocation.
    // The admin UI should call this once per feed with ?feeds=FXXX&limit=1000

    console.log("Starting AWIN feed import...");

    let feedUrls: { id: string; url: string; name: string }[] = [];

    if (feedIds.length > 0) {
      feedUrls = feedIds.map(id => ({
        id,
        url: `https://ui.awin.com/productdata-darwin-download/publisher/${PUBLISHER_ID}/${API_KEY}/1/feed/${id}.csv.gz`,
        name: id,
      }));
    } else {
      // No feeds specified → list active feeds but only import the FIRST one
      // to avoid memory issues. The admin UI should loop through feeds one by one.
      console.log("Fetching feed list to find active feeds...");
      const listResponse = await fetch(FEED_LIST_URL);
      if (!listResponse.ok) throw new Error(`Feed list fetch failed: ${listResponse.status}`);

      const csvContent = await listResponse.text();
      const lines = csvContent.split("\n").filter(l => l.trim());
      const listHeaders = parseCSVLine(lines[0]);

      const allActive: { id: string; url: string; name: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const feed: Record<string, string> = {};
        listHeaders.forEach((h, idx) => { feed[h.trim()] = values[idx] || ""; });

        if (feed["Membership Status"] === "active" && feed["URL"]) {
          allActive.push({ id: feed["Feed ID"], url: feed["URL"], name: feed["Advertiser Name"] });
        }
      }

      console.log(`Found ${allActive.length} active feeds — importing first one only to avoid memory limits`);

      if (allActive.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "No active feeds found. Join advertiser programs on AWIN first, or specify feed IDs with ?feeds=F1400",
            imported: 0,
            allActiveFeeds: [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      feedUrls = [allActive[0]];

      // Return the full list so the admin UI can queue the rest
      return new Response(
        JSON.stringify({
          success: true,
          message: `Found ${allActive.length} active feeds. Import them one at a time using ?feeds=FXXX&limit=1000`,
          allActiveFeeds: allActive.map(f => ({ feed_id: f.id, name: f.name })),
          importing: allActive[0],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each requested feed with streaming
    const feedResults: Record<string, unknown>[] = [];
    let totalImported = 0;
    let totalErrors = 0;

    for (const feed of feedUrls) {
      try {
        console.log(`\nImporting feed ${feed.id} (${feed.name})...`);
        const result = await processFeedStreaming(feed.url, limitParam, supabase);

        totalImported += result.imported;
        totalErrors += result.errors;

        feedResults.push({
          feed_id: feed.id,
          advertiser: feed.name,
          parsed: result.parsed,
          imported: result.imported,
          errors: result.errors,
        });

        console.log(`Feed ${feed.name}: ${result.imported} imported, ${result.errors} errors`);
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
        message: `Imported ${totalImported} products from ${feedUrls.length} feed(s)`,
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
