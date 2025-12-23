import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const trendingLooks = [
  {
    id: 1,
    image: outfit1,
    title: "Minimal Luxe",
    source: "Street Style",
    price: "$89 - $250",
    items: 4,
  },
  {
    id: 2,
    image: outfit2,
    title: "Urban Edge",
    source: "Fashion Week",
    price: "$120 - $380",
    items: 5,
  },
  {
    id: 3,
    image: outfit3,
    title: "Modern Classic",
    source: "Editorial",
    price: "$95 - $320",
    items: 4,
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
      {/* Minimal geometric background */}
      <div className="absolute inset-0 z-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-light-gray/50 to-transparent" />
        
        {/* Animated line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent origin-left"
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
              className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/10 mb-8"
            >
              <span className="w-2 h-2 bg-foreground rounded-full" />
              <span className="text-xs editorial-spacing text-foreground/60 font-medium">AI-POWERED STYLING</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[0.95] mb-8 tracking-tight"
            >
              <span className="block">Iconic</span>
              <span className="block">looks,</span>
              <span className="block italic font-light">your budget</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed"
            >
              Discover celebrity and TV-inspired outfits, recreated at every price point. From runway to real life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="group bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 h-14">
                <Link to="/stylist">
                  <Sparkles className="w-4 h-4 mr-3" />
                  Talk to AI Stylist
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-none border-foreground/20 hover:bg-foreground hover:text-background px-8 h-14">
                <Play className="w-4 h-4 mr-3" />
                Explore Looks
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-16 mt-16 pt-8 border-t border-foreground/10"
            >
              <div>
                <p className="text-4xl md:text-5xl font-serif tracking-tight">50K+</p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-2">LOOKS</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-serif tracking-tight">200+</p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-2">BRANDS</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-serif tracking-tight">4.9</p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-2">RATING</p>
              </div>
            </motion.div>
          </div>

          {/* Animated card carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2 relative h-[520px] md:h-[600px]"
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
                      opacity: isActive ? 1 : isNext ? 0.5 : isPrev ? 0.3 : 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute w-72 md:w-80 cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="relative bg-card overflow-hidden shadow-elevated border border-border">
                      {/* Image */}
                      <div className="relative h-96 md:h-[450px] overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pure-black/80 via-pure-black/20 to-transparent" />
                      </div>

                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <p className="text-xs text-white/50 mb-2 uppercase editorial-spacing">{look.source}</p>
                        <h3 className="font-serif text-2xl mb-4">{look.title}</h3>
                        <div className="flex items-center justify-between border-t border-white/20 pt-4">
                          <span className="text-sm font-medium">{look.price}</span>
                          <span className="text-xs text-white/50">{look.items} items</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
              {trendingLooks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-0.5 transition-all duration-300 ${
                    index === activeIndex ? "w-12 bg-foreground" : "w-6 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}