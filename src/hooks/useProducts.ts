import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Gender } from "@/lib/outfitData";

export type Product = {
  id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  category: string;
  gender: string;
  image_url: string;
  affiliate_url: string;
  retailer: string;
  provider: string;
  provider_product_id: string;
  style_tags: string[] | null;
  colors: string[] | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  gender?: Gender | "unisex";
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  colors?: string[];
  styleTags?: string[];
  provider?: string;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (filters: ProductFilters) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("products").select("*");

      // Text search
      if (filters.search && filters.search.trim()) {
        query = query.or(
          `title.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
        );
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      // Gender filter (include unisex items)
      if (filters.gender) {
        query = query.or(`gender.eq.${filters.gender},gender.eq.unisex`);
      }

      // Price range
      if (filters.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      // Brand filter
      if (filters.brands && filters.brands.length > 0) {
        query = query.in("brand", filters.brands);
      }

      // Color filter (array contains any)
      if (filters.colors && filters.colors.length > 0) {
        query = query.overlaps("colors", filters.colors);
      }

      // Style tags filter (array contains any)
      if (filters.styleTags && filters.styleTags.length > 0) {
        query = query.overlaps("style_tags", filters.styleTags);
      }

      // Provider filter
      if (filters.provider) {
        query = query.eq("provider", filters.provider);
      }

      const { data, error: queryError } = await query.order("last_seen_at", {
        ascending: false,
      }).limit(50);

      if (queryError) throw queryError;

      setProducts(data || []);
    } catch (err) {
      console.error("Failed to search products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async (): Promise<string[]> => {
    const { data } = await supabase
      .from("products")
      .select("category")
      .order("category");

    const unique = [...new Set((data || []).map((p) => p.category))];
    return unique;
  }, []);

  const getBrands = useCallback(async (): Promise<string[]> => {
    const { data } = await supabase
      .from("products")
      .select("brand")
      .order("brand");

    const unique = [...new Set((data || []).map((p) => p.brand))];
    return unique;
  }, []);

  return {
    products,
    loading,
    error,
    searchProducts,
    getCategories,
    getBrands,
  };
}
