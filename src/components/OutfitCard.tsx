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
      whileHover={{ y: -6 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-hot-pink/10 hover:border-hot-pink/30 shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Pink accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hot-pink via-fuchsia to-rose z-10" />
      
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <Heart className="w-4 h-4 text-hot-pink" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <Bookmark className="w-4 h-4 text-foreground" />
          </motion.button>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs text-white/70 mb-1 uppercase editorial-spacing">{inspiration}</p>
          <h3 className="font-serif text-xl text-white mb-3">{title}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-gradient-to-r from-hot-pink to-fuchsia text-white text-xs font-semibold rounded-full shadow-lg">
                {priceRange}
              </span>
              <span className="text-xs text-white/70">{items} items</span>
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
              className="text-xs px-3 py-1.5 bg-parisian-pink rounded-full text-foreground/70 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full rounded-xl border-hot-pink/20 hover:bg-gradient-to-r hover:from-hot-pink hover:to-fuchsia hover:text-white hover:border-transparent transition-all duration-300 group/btn"
        >
          <span className="font-medium">View Look</span>
          <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </motion.article>
  );
}