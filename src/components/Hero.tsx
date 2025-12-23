import { motion } from "framer-motion";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

const trendingLooks = [
  { id: 1, image: outfit1, title: "Minimal Luxe", price: "$89" },
  { id: 2, image: outfit2, title: "Urban Edge", price: "$120" },
  { id: 3, image: outfit3, title: "Modern Classic", price: "$95" },
];

const quickPrompts = [
  "Emily in Paris look under €100",
  "Casual Friday at the office",
  "Date night outfit",
  "Street style inspo",
];

export function Hero() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingLooks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % quickPrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/stylist?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      navigate("/stylist");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    navigate(`/stylist?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">AI-Powered Styling</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.05] tracking-tight mb-4">
              Your personal stylist,
              <br />
              <span className="italic font-light">at any budget</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Describe any look — from TV shows to celebrities — and get shoppable outfits tailored to your price range.
            </p>
          </motion.div>

          {/* AI Chat Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
              <div className="relative bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={quickPrompts[placeholderIndex]}
                  className="w-full px-6 py-5 pr-14 text-base bg-transparent outline-none placeholder:text-muted-foreground/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Quick prompts */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-foreground hover:text-background transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Style deck carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-[280px] md:h-[320px] mb-8"
          >
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
                      scale: isActive ? 1 : 0.85,
                      x: isActive ? 0 : isNext ? 180 : isPrev ? -180 : 0,
                      rotateY: isActive ? 0 : isNext ? -8 : isPrev ? 8 : 0,
                      zIndex: isActive ? 30 : 10,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute w-44 md:w-52 cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="relative bg-card overflow-hidden rounded-xl shadow-elevated border border-border">
                      <div className="relative h-56 md:h-64 overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-serif text-lg">{look.title}</h3>
                        <p className="text-sm text-white/70">From {look.price}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {trendingLooks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? "bg-foreground w-6" : "bg-foreground/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">50K+</span> looks created
            </span>
            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">200+</span> brands
            </span>
            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">4.9★</span> rating
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
