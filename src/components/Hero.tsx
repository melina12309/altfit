import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const trendingLooks = [
  {
    id: 1,
    image: outfit1,
    title: "Parisian Chic",
    source: "Emily in Paris S4",
    price: "$89 - $250",
    items: 4,
    category: "TV Show",
  },
  {
    id: 2,
    image: outfit2,
    title: "Street Elegance",
    source: "Kendall Jenner",
    price: "$120 - $380",
    items: 5,
    category: "Celebrity",
  },
  {
    id: 3,
    image: outfit3,
    title: "Met Gala Inspired",
    source: "Red Carpet 2024",
    price: "$95 - $420",
    items: 6,
    category: "Event",
  },
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingLooks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Sophisticated background */}
      <div className="absolute inset-0 z-0">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-platinum/30 to-background" />
        
        {/* Geometric patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Gold accent line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent origin-left"
        />
        
        {/* Floating gold dots */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-20 w-2 h-2 rounded-full bg-gold"
        />
        <motion.div
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-40 left-32 w-3 h-3 rounded-full bg-gold"
        />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-6"
            >
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span className="text-xs editorial-spacing text-foreground/80 font-medium">AI-POWERED STYLING</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.05] mb-6"
            >
              <span className="block">Iconic looks,</span>
              <span className="block mt-2 relative">
                <span className="relative inline-block">
                  your budget
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gold origin-left"
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md leading-relaxed"
            >
              Discover celebrity and TV-inspired outfits, recreated at every price point. From runway to real life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group bg-foreground text-background hover:bg-foreground/90 px-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My Look
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-foreground/20 hover:bg-foreground/5 px-8">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-12 mt-12 pt-8 border-t border-border"
            >
              <div>
                <p className="text-3xl md:text-4xl font-serif">50K<span className="text-gold">+</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">LOOKS CREATED</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif">200<span className="text-gold">+</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">BRANDS</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif">4.9<span className="text-gold">★</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">USER RATING</p>
              </div>
            </motion.div>
          </div>

          {/* Animated card carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2 relative h-[500px] md:h-[600px]"
          >
            {/* Card stack */}
            <div className="relative w-full h-full flex items-center justify-center">
              {trendingLooks.map((look, index) => {
                const offset = (index - activeIndex + trendingLooks.length) % trendingLooks.length;
                const isActive = offset === 0;
                const isNext = offset === 1;
                const isPrev = offset === trendingLooks.length - 1;

                return (
                  <motion.div
                    key={look.id}
                    animate={{
                      scale: isActive ? 1 : isNext ? 0.9 : isPrev ? 0.85 : 0.8,
                      x: isActive ? 0 : isNext ? 60 : isPrev ? -60 : 0,
                      y: isActive ? 0 : isNext ? 20 : isPrev ? 30 : 40,
                      rotateY: isActive ? 0 : isNext ? -5 : isPrev ? 5 : 0,
                      zIndex: isActive ? 30 : isNext ? 20 : isPrev ? 10 : 0,
                      opacity: isActive ? 1 : isNext ? 0.7 : isPrev ? 0.5 : 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute w-72 md:w-80 cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                    style={{ perspective: "1000px" }}
                  >
                    <div className="relative bg-card rounded-2xl overflow-hidden shadow-elevated border border-border/50">
                      {/* Image */}
                      <div className="relative h-80 md:h-96 overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                        
                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gold text-foreground text-xs font-medium rounded-full">
                            {look.category}
                          </span>
                        </div>
                      </div>

                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                        <p className="text-xs text-primary-foreground/70 mb-1 uppercase editorial-spacing">{look.source}</p>
                        <h3 className="font-serif text-xl mb-3">{look.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{look.price}</span>
                          <span className="text-xs text-primary-foreground/70">{look.items} items</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
              {trendingLooks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-gold" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 right-8 w-20 h-20 border border-gold/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 -left-4 w-12 h-12 border border-foreground/10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}