import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-fashion.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fashion editorial"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs editorial-spacing text-muted-foreground mb-4"
          >
            AI-POWERED STYLE DISCOVERY
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-6"
          >
            Iconic looks,
            <br />
            <span className="italic">your budget</span>
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
            <Button size="lg" className="group">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Look
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
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
      </div>
    </section>
  );
}
