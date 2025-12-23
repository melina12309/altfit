import { motion } from "framer-motion";
import { Heart, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-card transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/90 backdrop-blur-sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/90 backdrop-blur-sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 font-medium">
            {priceRange}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{inspiration}</p>
        <h3 className="font-serif text-lg mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{items} items</span>
          <Button variant="ghost" size="sm" className="h-8 text-xs group/btn">
            View Look
            <ExternalLink className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
