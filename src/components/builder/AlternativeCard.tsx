import { motion } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OutfitAlternative } from "@/lib/outfitData";

interface AlternativeCardProps {
  item: OutfitAlternative;
  onSelect: () => void;
}

export function AlternativeCard({ item, onSelect }: AlternativeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-foreground/30 bg-card transition-all"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.brand}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold">€{item.price}</span>
          {item.shopUrl && (
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.shopUrl, "_blank");
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Select overlay */}
      <div className="absolute inset-0 bg-foreground/90 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Use this</span>
        </div>
      </div>
    </motion.div>
  );
}
