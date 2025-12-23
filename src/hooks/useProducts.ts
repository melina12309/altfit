import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Gender } from "@/lib/outfitData";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  gender: string;
  image: string;
  shop_url: string | null;
  tags: string[];
  colors: string[];
};

export type ProductFilters = {
  search?: string;
  category?: string;
  gender?: Gender | "unisex";
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  colors?: string[];
  tags?: string[];
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
          `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
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

      // Tags filter (array contains any)
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      const { data, error: queryError } = await query.order("created_at", {
        ascending: false,
      });

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
