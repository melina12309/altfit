import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
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
    title: "Manhattan Glamour",
    source: "Carrie Bradshaw",
    price: "$120 - $380",
    items: 5,
    category: "SATC",
  },
  {
    id: 3,
    image: outfit3,
    title: "French Romance",
    source: "Street Style Paris",
    price: "$95 - $320",
    items: 4,
    category: "Editorial",
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
      {/* Romantic gradient background */}
      <div className="absolute inset-0 z-0">
        {/* Pink gradient washes */}
        <div className="absolute inset-0 bg-gradient-to-br from-parisian-pink via-background to-champagne/30" />
        
        {/* Floating pink orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-hot-pink/20 to-fuchsia/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-rose/20 to-blush/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-10 w-64 h-64 bg-gradient-to-br from-champagne/40 to-gold/10 rounded-full blur-3xl"
        />

        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Decorative hearts */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-32 left-[15%] text-hot-pink/20"
        >
          <Heart className="w-8 h-8 fill-current" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-40 right-[20%] text-rose/30"
        >
          <Heart className="w-6 h-6 fill-current" />
        </motion.div>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-hot-pink/10 to-fuchsia/10 border border-hot-pink/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-hot-pink" />
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
                <span className="italic bg-gradient-to-r from-hot-pink via-fuchsia to-lipstick bg-clip-text text-transparent">
                  your budget
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md leading-relaxed"
            >
              Channel your inner Carrie Bradshaw or Emily Cooper. Recreate iconic TV & celebrity looks at any price point.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group bg-gradient-to-r from-hot-pink to-fuchsia hover:from-hot-pink/90 hover:to-fuchsia/90 text-white shadow-lg shadow-hot-pink/25 px-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My Look
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-hot-pink/30 text-foreground hover:bg-hot-pink/5 hover:border-hot-pink/50 px-8">
                <Heart className="w-4 h-4 mr-2" />
                Explore Looks
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-10 mt-12 pt-8 border-t border-hot-pink/10"
            >
              <div>
                <p className="text-3xl md:text-4xl font-serif">50K<span className="text-hot-pink">+</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">LOOKS CREATED</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif">200<span className="text-hot-pink">+</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">BRANDS</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif">4.9<span className="text-hot-pink">★</span></p>
                <p className="text-xs text-muted-foreground editorial-spacing mt-1">RATING</p>
              </div>
            </motion.div>
          </div>

          {/* Animated card carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2 relative h-[500px] md:h-[580px]"
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
                      scale: isActive ? 1 : isNext ? 0.88 : isPrev ? 0.82 : 0.75,
                      x: isActive ? 0 : isNext ? 70 : isPrev ? -70 : 0,
                      y: isActive ? 0 : isNext ? 25 : isPrev ? 35 : 45,
                      rotateY: isActive ? 0 : isNext ? -8 : isPrev ? 8 : 0,
                      zIndex: isActive ? 30 : isNext ? 20 : isPrev ? 10 : 0,
                      opacity: isActive ? 1 : isNext ? 0.6 : isPrev ? 0.4 : 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute w-72 md:w-80 cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                    style={{ perspective: "1000px" }}
                  >
                    <div className="relative bg-card rounded-3xl overflow-hidden shadow-elevated border-2 border-hot-pink/10 hover:border-hot-pink/30 transition-colors">
                      {/* Pink accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hot-pink via-fuchsia to-rose z-10" />
                      
                      {/* Image */}
                      <div className="relative h-80 md:h-96 overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                        
                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-hot-pink to-fuchsia text-white text-xs font-medium rounded-full shadow-lg">
                            {look.category}
                          </span>
                        </div>
                        
                        {/* Heart button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                        >
                          <Heart className="w-4 h-4 text-hot-pink" />
                        </motion.button>
                      </div>

                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-xs text-white/70 mb-1 uppercase editorial-spacing">{look.source}</p>
                        <h3 className="font-serif text-xl mb-3">{look.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">{look.price}</span>
                          <span className="text-xs text-white/70">{look.items} items</span>
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
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? "w-8 bg-gradient-to-r from-hot-pink to-fuchsia" 
                      : "w-2 bg-hot-pink/20 hover:bg-hot-pink/40"
                  }`}
                />
              ))}
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 right-12 w-16 h-16 rounded-full border-2 border-hot-pink/20"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-24 -left-2 w-4 h-4 rounded-full bg-gradient-to-r from-hot-pink to-fuchsia shadow-lg shadow-hot-pink/30"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}