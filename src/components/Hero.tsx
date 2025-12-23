import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-fashion.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient with animated colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-violet-100 dark:from-rose-950/30 dark:via-background dark:to-violet-950/30" />
        
        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-300/40 to-orange-200/40 dark:from-pink-500/20 dark:to-orange-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-violet-300/40 to-blue-200/40 dark:from-violet-500/20 dark:to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-10 w-64 h-64 bg-gradient-to-br from-amber-200/50 to-rose-200/50 dark:from-amber-500/20 dark:to-rose-500/20 rounded-full blur-3xl"
        />

        {/* Mesh grid overlay for modern feel */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs editorial-spacing text-primary font-medium">AI-POWERED STYLE DISCOVERY</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-6"
            >
              Iconic looks,
              <br />
              <span className="italic bg-gradient-to-r from-primary via-rose-500 to-violet-500 bg-clip-text text-transparent">your budget</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md"
            >
              Discover celebrity and TV-inspired outfits, recreated at every price point. From runway to real life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90 shadow-lg shadow-primary/25">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My Look
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="backdrop-blur-sm">
                Explore Collections
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-8 mt-12 pt-8 border-t border-border/50"
            >
              <div>
                <p className="text-2xl md:text-3xl font-serif">50K+</p>
                <p className="text-xs text-muted-foreground editorial-spacing">LOOKS CREATED</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif">200+</p>
                <p className="text-xs text-muted-foreground editorial-spacing">BRANDS</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif">$12</p>
                <p className="text-xs text-muted-foreground editorial-spacing">AVG. SAVINGS</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative z-20 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10"
              >
                <img
                  src={heroImage}
                  alt="Fashion editorial"
                  className="w-full h-[400px] md:h-[500px] object-cover object-top"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Floating tag */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/90 dark:bg-black/80 rounded-2xl p-4"
                >
                  <p className="text-xs text-muted-foreground mb-1">Inspired by</p>
                  <p className="font-serif text-lg">Emily in Paris S4</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">$89 - $250</span>
                    <span className="text-xs text-muted-foreground">4 items</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl rotate-12 z-10 shadow-lg"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full z-10 shadow-lg"
              />
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl z-10 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}