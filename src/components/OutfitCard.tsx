import { motion } from "framer-motion";
import { Heart, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AccentColor = "terracotta" | "sage" | "blush" | "gold" | "violet";

interface OutfitCardProps {
  image: string;
  title: string;
  inspiration: string;
  priceRange: string;
  items: number;
  tags: string[];
  index?: number;
  accentColor?: AccentColor;
}

const accentClasses: Record<AccentColor, { bg: string; text: string; border: string; gradient: string }> = {
  terracotta: {
    bg: "bg-terracotta/10",
    text: "text-terracotta",
    border: "border-terracotta/30",
    gradient: "from-terracotta/80 to-terracotta/40",
  },
  sage: {
    bg: "bg-sage/10",
    text: "text-sage",
    border: "border-sage/30",
    gradient: "from-sage/80 to-sage/40",
  },
  blush: {
    bg: "bg-blush/10",
    text: "text-blush",
    border: "border-blush/30",
    gradient: "from-blush/80 to-blush/40",
  },
  gold: {
    bg: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/30",
    gradient: "from-gold/80 to-gold/40",
  },
  violet: {
    bg: "bg-violet/10",
    text: "text-violet",
    border: "border-violet/30",
    gradient: "from-violet/80 to-violet/40",
  },
};

export function OutfitCard({
  image,
  title,
  inspiration,
  priceRange,
  items,
  tags,
  index = 0,
  accentColor = "terracotta",
}: OutfitCardProps) {
  const accent = accentClasses[accentColor];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent.gradient}`} />

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background">
              <Heart className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg hover:bg-background">
              <Bookmark className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <Badge className={`${accent.bg} ${accent.text} ${accent.border} border backdrop-blur-sm font-semibold text-sm px-3 py-1.5`}>
            {priceRange}
          </Badge>
          <span className="text-white/90 text-sm font-medium">{items} pieces</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${accent.bg} mb-3`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${accent.text}`} />
          <p className={`text-xs font-medium ${accent.text}`}>{inspiration}</p>
        </div>
        
        <h3 className="font-serif text-xl mb-3 group-hover:text-terracotta transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 bg-secondary/80 rounded-full text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button 
          variant="outline" 
          className={`w-full group/btn rounded-full ${accent.border} hover:${accent.bg} hover:border-transparent transition-all duration-300`}
        >
          <span className="font-medium">View Look</span>
          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </motion.article>
  );
}
