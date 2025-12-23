import { motion } from "framer-motion";
import { ShoppingBag, Bookmark, Shuffle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { OutfitData } from "@/lib/styleChat";

interface OutfitCardProps {
  outfit: OutfitData;
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const budgetTiers = outfit.budget_tiers || [];
  const outfitItems = outfit.outfit || [];
  
  const [selectedTierIndex, setSelectedTierIndex] = useState(
    budgetTiers.length > 0 ? Math.min(1, budgetTiers.length - 1) : 0
  );
  
  const selectedTier = budgetTiers[selectedTierIndex];
  
  // Filter items based on selected budget tier, or show all if no tiers
  const visibleItems = selectedTier?.products 
    ? outfitItems.filter(item => selectedTier.products.includes(item.category))
    : outfitItems;

  const formatPrice = (price: number) => `€${price}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-medium">{outfit.look_title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Inspired by {outfit.inspiration}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {selectedTier ? formatPrice(selectedTier.total_price) : formatPrice(outfit.budget_range.min)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          {outfit.why_this_works}
        </p>
      </div>

      {/* Budget Tier Selector */}
      {budgetTiers.length > 0 && (
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex gap-2">
            {budgetTiers.map((tier, index) => (
              <button
                key={tier.label}
                onClick={() => setSelectedTierIndex(index)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedTierIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-secondary text-foreground"
                }`}
              >
                <span className="block">{formatPrice(tier.total_price)}</span>
                <span className="block text-xs opacity-70">{tier.label}</span>
              </button>
            ))}
          </div>
          {selectedTier && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {selectedTier.note}
            </p>
          )}
        </div>
      )}

      {/* Items Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.product_id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1 capitalize">{item.category}</p>
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.brand}</p>
              <p className="text-xs font-medium mt-1">{formatPrice(item.price)}</p>
              
              {item.style_tags && item.style_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.style_tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {item.affiliate_url && (
                <a 
                  href={item.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-background rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              
              {!item.affiliate_url && (
                <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-background rounded-full">
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {outfit.actions && (
        <div className="p-4 border-t border-border flex gap-2">
          {outfit.actions.save && (
            <Button variant="outline" size="sm" className="flex-1">
              <Bookmark className="w-4 h-4 mr-2" />
              Save Look
            </Button>
          )}
          {outfit.actions.remix && (
            <Button variant="outline" size="sm" className="flex-1">
              <Shuffle className="w-4 h-4 mr-2" />
              Remix
            </Button>
          )}
          {outfit.actions.shop && (
            <Button size="sm" className="flex-1">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop All
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
