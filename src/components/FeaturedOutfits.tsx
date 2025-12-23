import { motion } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
import { Heart, Sparkles } from "lucide-react";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const outfits = [
  {
    image: outfit1,
    title: "The Carrie Look",
    inspiration: "Sex and the City",
    priceRange: "$89 - $245",
    items: 5,
    tags: ["Manhattan", "Chic", "Zara + Vestiaire"],
  },
  {
    image: outfit2,
    title: "Emily's Parisian Day",
    inspiration: "Emily in Paris",
    priceRange: "$120 - $380",
    items: 4,
    tags: ["French", "Romantic", "Mango + Vinted"],
  },
  {
    image: outfit3,
    title: "Charlotte's Elegance",
    inspiration: "SATC Classics",
    priceRange: "$150 - $420",
    items: 3,
    tags: ["Timeless", "Refined", "H&M + TheRealReal"],
  },
];

export function FeaturedOutfits() {
  return (
    <section id="collections" className="py-20 md:py-28 relative overflow-hidden">
      {/* Romantic background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-parisian-pink/50 via-background to-champagne/30" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-1/4 w-80 h-80 bg-hot-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-1/4 w-96 h-96 bg-rose/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14"
        >
          <div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-hot-pink/10 to-fuchsia/10 border border-hot-pink/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-hot-pink" />
              <span className="text-xs font-medium editorial-spacing text-foreground/80">
                TRENDING NOW
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif">
              Iconic{" "}
              <span className="relative inline-block">
                <span className="italic bg-gradient-to-r from-hot-pink via-fuchsia to-lipstick bg-clip-text text-transparent">
                  looks
                </span>
                <motion.span 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-hot-pink to-fuchsia origin-left"
                />
              </span>
            </h2>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 5 }}
            className="text-sm font-medium text-muted-foreground hover:text-hot-pink mt-6 md:mt-0 transition-colors flex items-center gap-2 group"
          >
            <Heart className="w-4 h-4 group-hover:fill-hot-pink group-hover:text-hot-pink transition-colors" />
            View all looks
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {outfits.map((outfit, index) => (
            <OutfitCard key={outfit.title} {...outfit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}