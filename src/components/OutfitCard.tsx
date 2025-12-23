import { motion } from "framer-motion";
import { Heart, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OutfitCardProps {
  id: string;
  image: string;
  title: string;
  inspiration: string;
  priceRange: string;
  items: number;
  tags: string[];
  index?: number;
}

export function OutfitCard({
  id,
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
      className="group relative bg-card overflow-hidden border border-border hover:border-foreground/20 transition-all duration-500"
    >
      {/* Image */}
      <Link to={`/outfit/${id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-pure-black/80 via-pure-black/20 to-transparent" />
        
        {/* Action buttons */}
        <div 
          className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          onClick={(e) => e.preventDefault()}
        >
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-xs text-white/50 mb-1 uppercase editorial-spacing">{inspiration}</p>
          <h3 className="font-serif text-xl mb-4">{title}</h3>
          
          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <span className="text-sm font-medium">{priceRange}</span>
            <span className="text-xs text-white/50">{items} items</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 bg-card">
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 border border-border text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button 
          asChild
          variant="outline" 
          className="w-full rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 group/btn h-12"
        >
          <Link to={`/outfit/${id}`}>
            <span className="font-medium">View Look</span>
            <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}