import { motion } from "framer-motion";
import { Lock, Unlock, ExternalLink, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OutfitItemData } from "@/lib/outfitData";
import { CATEGORY_LABELS } from "@/lib/outfitData";

interface OutfitItemCardProps {
  item: OutfitItemData;
  isSelected: boolean;
  onSelect: () => void;
  onToggleLock: () => void;
}

export function OutfitItemCard({ item, isSelected, onSelect, onToggleLock }: OutfitItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
        isSelected 
          ? "border-foreground ring-2 ring-foreground/20" 
          : item.isLocked 
            ? "border-amber-500/50" 
            : "border-border hover:border-foreground/30"
      }`}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Lock badge */}
      {item.isLocked && (
        <div className="absolute top-2 left-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center">
          <Lock className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Category badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full">
        <span className="text-xs font-medium">{CATEGORY_LABELS[item.category]}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-white/70">{item.brand}</p>
          <p className="text-sm font-semibold mt-1">€{item.price}</p>
        </div>
      </div>

      {/* Action buttons on hover */}
      <div className="absolute top-10 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="w-7 h-7"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
        >
          {item.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        </Button>
        {item.shopUrl && (
          <Button
            size="icon"
            variant="secondary"
            className="w-7 h-7"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.shopUrl, "_blank");
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Replace indicator when selected */}
      {isSelected && !item.isLocked && (
        <div className="absolute inset-x-0 bottom-0 bg-foreground text-background py-2 flex items-center justify-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-xs font-medium">Select replacement →</span>
        </div>
      )}
    </motion.div>
  );
}
