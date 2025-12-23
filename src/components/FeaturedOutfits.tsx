import { motion } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
import { ArrowRight } from "lucide-react";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const outfits = [
  {
    image: outfit1,
    title: "The Power Look",
    inspiration: "Street Style",
    priceRange: "$89 - $245",
    items: 5,
    tags: ["Minimal", "Chic", "Zara"],
  },
  {
    image: outfit2,
    title: "Urban Essential",
    inspiration: "Fashion Week",
    priceRange: "$120 - $380",
    items: 4,
    tags: ["Modern", "Sleek", "COS"],
  },
  {
    image: outfit3,
    title: "Evening Edit",
    inspiration: "Editorial",
    priceRange: "$150 - $420",
    items: 3,
    tags: ["Elegant", "Refined", "Arket"],
  },
];

export function FeaturedOutfits() {
  return (
    <section id="collections" className="py-24 md:py-32 relative bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
        >
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium editorial-spacing text-muted-foreground mb-4 block"
            >
              CURATED SELECTION
            </motion.span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight">
              Trending
              <span className="block italic font-light">looks</span>
            </h2>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 5 }}
            className="text-sm font-medium text-foreground mt-8 md:mt-0 flex items-center gap-3 group border-b border-foreground pb-1"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {outfits.map((outfit, index) => (
            <OutfitCard key={outfit.title} {...outfit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}