import { motion } from "framer-motion";
import { Tv, Star, Calendar, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Tv, label: "TV Shows", description: "Emily in Paris, Euphoria..." },
  { icon: Star, label: "Celebrities", description: "Hailey Bieber, Zendaya..." },
  { icon: Calendar, label: "Events", description: "Met Gala, Fashion Week..." },
  { icon: Camera, label: "Upload Photo", description: "Match any look" },
  { icon: Sparkles, label: "Describe Vibe", description: "Tell us your style" },
];

export function CategoryPills() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs editorial-spacing text-muted-foreground mb-3">
            START YOUR JOURNEY
          </p>
          <h2 className="text-3xl md:text-4xl font-serif">
            Where do you find inspiration?
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Button
                variant="pill"
                size="lg"
                className="h-auto py-4 px-6 flex-col items-start text-left hover:shadow-card hover:border-foreground/20 transition-all"
              >
                <category.icon className="w-5 h-5 mb-2 text-accent" />
                <span className="font-medium text-sm">{category.label}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {category.description}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
