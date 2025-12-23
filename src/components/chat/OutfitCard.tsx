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
  const [selectedTier, setSelectedTier] = useState<"budget" | "mid" | "premium">("mid");
  
  const tierLabels = {
    budget: outfit.budgetTiers.budget.total,
    mid: outfit.budgetTiers.mid.total,
    premium: outfit.budgetTiers.premium.total,
  };

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
            <h3 className="font-serif text-xl font-medium">{outfit.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Inspired by {outfit.inspiration}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {tierLabels[selectedTier]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          {outfit.whyItWorks}
        </p>
      </div>

      {/* Budget Tier Selector */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex gap-2">
          {(["budget", "mid", "premium"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedTier === tier
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary text-foreground"
              }`}
            >
              <span className="block">{tierLabels[tier]}</span>
              <span className="block text-xs opacity-70 capitalize">{tier}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {outfit.budgetTiers[selectedTier].note}
        </p>
      </div>

      {/* Items Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {outfit.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.brand}</p>
              <p className="text-xs font-medium mt-1">{item.priceRange}</p>
              
              <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-background rounded-full">
                <ExternalLink className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Bookmark className="w-4 h-4 mr-2" />
          Save Look
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Shuffle className="w-4 h-4 mr-2" />
          Remix
        </Button>
        <Button size="sm" className="flex-1">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Shop All
        </Button>
      </div>
    </motion.div>
  );
}
