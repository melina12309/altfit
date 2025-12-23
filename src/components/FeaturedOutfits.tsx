import { motion } from "framer-motion";
import { OutfitCard } from "./OutfitCard";
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
  },
  {
    image: outfit2,
    title: "Parisian Street Style",
    inspiration: "Inspired by Hailey Bieber",
    priceRange: "$120 - $380",
    items: 4,
    tags: ["Casual", "Elevated", "Mix: Mango + Vinted"],
  },
  {
    image: outfit3,
    title: "Evening Elegance",
    inspiration: "Met Gala 2024",
    priceRange: "$150 - $420",
    items: 3,
    tags: ["Evening", "Glamour", "Mix: H&M + TheRealReal"],
  },
];

export function FeaturedOutfits() {
  return (
    <section id="collections" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <p className="text-xs editorial-spacing text-muted-foreground mb-3">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl md:text-4xl font-serif">
              Trending looks
            </h2>
          </div>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground mt-4 md:mt-0 transition-colors"
          >
            View all collections →
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map((outfit, index) => (
            <OutfitCard key={outfit.title} {...outfit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
