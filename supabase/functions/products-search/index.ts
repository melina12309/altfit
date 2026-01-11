import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.headers.get("x-real-ip") ||
         req.headers.get("cf-connecting-ip") ||
         "unknown";
};

// Check rate limit for an IP
const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  // Clean up old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now - value.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    resetIn: RATE_LIMIT_WINDOW_MS - (now - record.windowStart)
  };
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

  // Apply rate limiting
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  const rateLimitHeaders = {
    "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
  };

  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 10)}...`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      }
    );
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
      headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
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
