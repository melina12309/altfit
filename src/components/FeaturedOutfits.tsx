import { motion } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
import { TrendingUp } from "lucide-react";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const outfits = [
  {
    image: outfit1,
    title: "The Power Meeting",
    inspiration: "Emily in Paris S4",
    priceRange: "$89 - $245",
    items: 5,
    tags: ["Office", "Chic", "Zara + Vestiaire"],
  },
  {
    image: outfit2,
    title: "Parisian Street Style",
    inspiration: "Hailey Bieber",
    priceRange: "$120 - $380",
    items: 4,
    tags: ["Casual", "Elevated", "Mango + Vinted"],
  },
  {
    image: outfit3,
    title: "Evening Elegance",
    inspiration: "Met Gala 2024",
    priceRange: "$150 - $420",
    items: 3,
    tags: ["Evening", "Glamour", "H&M + TheRealReal"],
  },
];

export function FeaturedOutfits() {
  return (
    <section id="collections" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-4"
            >
              <TrendingUp className="w-4 h-4 text-gold" />
              <span className="text-xs font-medium editorial-spacing text-foreground/80">
                TRENDING NOW
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif">
              Curated{" "}
              <span className="relative inline-block">
                looks
                <motion.span 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold origin-left"
                />
              </span>
            </h2>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 5 }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground mt-6 md:mt-0 transition-colors flex items-center gap-2 group"
          >
            View all collections
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