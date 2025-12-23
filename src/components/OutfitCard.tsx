import { motion } from "framer-motion";
import { Heart, Bookmark, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutfitCardProps {
  image: string;
  title: string;
  inspiration: string;
  priceRange: string;
  items: number;
  tags: string[];
  index?: number;
}

export function OutfitCard({
  image,
  title,
  inspiration,
  priceRange,
  items,
  tags,
  index = 0,
}: OutfitCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-gold/30 hover:shadow-elevated transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs text-primary-foreground/70 mb-1 uppercase editorial-spacing">{inspiration}</p>
          <h3 className="font-serif text-xl text-primary-foreground mb-3">{title}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-gold text-foreground text-xs font-semibold rounded-full">
                {priceRange}
              </span>
              <span className="text-xs text-primary-foreground/70">{items} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-card">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 bg-secondary rounded-full text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full rounded-lg border-foreground/10 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 group/btn"
        >
          <span className="font-medium">View Look</span>
          <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </motion.article>
  );
}