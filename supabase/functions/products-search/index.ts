import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize user input by escaping special SQL pattern characters
const sanitizeForLike = (input: string): string => {
  // Escape %, _, and backslash which have special meaning in LIKE/ILIKE
  return input.replace(/[%_\\]/g, '\\$&');
};

// Validate gender against allowed values
const validGenders = ['men', 'women', 'unisex'] as const;
const isValidGender = (gender: unknown): gender is string => {
  return typeof gender === 'string' && validGenders.includes(gender as typeof validGenders[number]);
};

// Validate and sanitize string input
const sanitizeString = (input: unknown, maxLength = 200): string | null => {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return sanitizeForLike(trimmed);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body = await req.json();
    const { query, filters, budget } = body;

    console.log("Product search request:", { query, filters, budget });

    let dbQuery = supabase
      .from("products")
      .select("*");

    // Text search across title, brand, category - SANITIZED
    const safeQuery = sanitizeString(query);
    if (safeQuery) {
      dbQuery = dbQuery.or(
        `title.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,category.ilike.%${safeQuery}%`
      );
    }

    // Category filter - SANITIZED
    const safeCategory = sanitizeString(filters?.category);
    if (safeCategory && safeCategory !== "all") {
      dbQuery = dbQuery.eq("category", filters.category);
    }

    // Gender filter (include unisex items) - VALIDATED against allowed values
    if (isValidGender(filters?.gender)) {
      dbQuery = dbQuery.or(`gender.eq.${filters.gender},gender.eq.unisex`);
    }

    // Budget constraint
    if (budget !== undefined && budget > 0) {
      dbQuery = dbQuery.lte("price", budget);
    }

    // Price range filters
    if (filters?.minPrice !== undefined) {
      dbQuery = dbQuery.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      dbQuery = dbQuery.lte("price", filters.maxPrice);
    }

    // Brand filter
    if (filters?.brands && filters.brands.length > 0) {
      dbQuery = dbQuery.in("brand", filters.brands);
    }

    // Style tags filter
    if (filters?.styleTags && filters.styleTags.length > 0) {
      dbQuery = dbQuery.overlaps("style_tags", filters.styleTags);
    }

    // Colors filter
    if (filters?.colors && filters.colors.length > 0) {
      dbQuery = dbQuery.overlaps("colors", filters.colors);
    }

    // Provider filter
    if (filters?.provider) {
      dbQuery = dbQuery.eq("provider", filters.provider);
    }

    // Order by relevance (most recently seen first)
    const { data, error } = await dbQuery
      .order("last_seen_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} products`);

    return new Response(JSON.stringify({ products: data || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("products-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
