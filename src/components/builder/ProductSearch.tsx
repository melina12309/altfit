import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Plus, ChevronDown, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProducts, type Product, type ProductFilters } from "@/hooks/useProducts";
import type { Gender, OutfitItemData } from "@/lib/outfitData";

const CATEGORIES = ["all", "tops", "bottoms", "shoes", "outerwear", "accessories"];

interface ProductSearchProps {
  gender: Gender;
  onAddToOutfit: (item: OutfitItemData) => void;
  currentOutfitIds: string[];
}

// Generate redirect URL for affiliate tracking
const getShopUrl = (productId: string) => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const sessionId = sessionStorage.getItem("session_id") || crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
  return `${baseUrl}/functions/v1/product-redirect?productId=${productId}&sessionId=${sessionId}`;
};

export function ProductSearch({ gender, onAddToOutfit, currentOutfitIds }: ProductSearchProps) {
  const { products, loading, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search when filters change
  useEffect(() => {
    const filters: ProductFilters = {
      search: debouncedSearch,
      category: selectedCategory,
      gender: gender,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };
    searchProducts(filters);
  }, [debouncedSearch, selectedCategory, gender, priceRange, searchProducts]);

  const handleAddProduct = useCallback((product: Product) => {
    const outfitItem: OutfitItemData = {
      id: product.id,
      name: product.title,
      brand: product.brand,
      price: product.price,
      category: product.category as OutfitItemData["category"],
      image: product.image_url,
      shopUrl: getShopUrl(product.id),
      isLocked: false,
    };
    onAddToOutfit(outfitItem);
  }, [onAddToOutfit]);

  const isInOutfit = (productId: string) => currentOutfitIds.includes(productId);

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-muted/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expandable Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Price Range: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={500}
                step={10}
                className="py-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Affiliate Disclosure */}
      <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-b border-border/50">
        We may earn a commission from purchases made through our links.
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    isInOutfit(product.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-2.5">
                    <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-semibold">€{product.price}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {product.retailer}
                      </Badge>
                    </div>
                    
                    {/* Shop Button */}
                    <a
                      href={getShopUrl(product.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Shop
                    </a>
                  </div>

                  {/* Add Button Overlay */}
                  <button
                    onClick={() => handleAddProduct(product)}
                    disabled={isInOutfit(product.id)}
                    className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                      isInOutfit(product.id) ? "bg-primary/20" : "bg-background/80"
                    }`}
                  >
                    {isInOutfit(product.id) ? (
                      <span className="text-sm font-medium text-primary">In Outfit</span>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Add</span>
                      </div>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
