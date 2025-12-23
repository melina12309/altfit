import { motion } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
import { Sparkles } from "lucide-react";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const outfits = [
  {
    image: outfit1,
    title: "The Power Meeting",
    inspiration: "Inspired by Emily in Paris",
    priceRange: "$89 - $245",
    items: 5,
    tags: ["Office", "Chic", "Mix: Zara + Vestiaire"],
    accentColor: "terracotta" as const,
  },
  {
    image: outfit2,
    title: "Parisian Street Style",
    inspiration: "Inspired by Hailey Bieber",
    priceRange: "$120 - $380",
    items: 4,
    tags: ["Casual", "Elevated", "Mix: Mango + Vinted"],
    accentColor: "sage" as const,
  },
  {
    image: outfit3,
    title: "Evening Elegance",
    inspiration: "Met Gala 2024",
    priceRange: "$150 - $420",
    items: 3,
    tags: ["Evening", "Glamour", "Mix: H&M + TheRealReal"],
    accentColor: "blush" as const,
  },
];

export function FeaturedOutfits() {
  return (
    <section id="collections" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sage/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blush/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-terracotta/20 via-blush/20 to-sage/20 border border-terracotta/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span className="text-xs font-medium editorial-spacing text-foreground/80">
                CURATED FOR YOU
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-serif">
              Trending{" "}
              <span className="relative">
                looks
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-terracotta/40"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,8 Q25,0 50,8 T100,8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 5 }}
            className="text-sm font-medium text-foreground hover:text-terracotta mt-4 md:mt-0 transition-colors flex items-center gap-2"
          >
            View all collections
            <span className="inline-block transition-transform">→</span>
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
