import { motion } from "framer-motion";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const quickPrompts = [
  "Emily in Paris look under €100",
  "Casual Friday at the office",
  "Date night outfit",
  "Street style inspo",
];

export function Hero() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

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
    <section className="relative min-h-[85vh] flex items-center justify-center pt-16 pb-12 overflow-hidden bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
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

          {/* AI Chat Input - The star of the show */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
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

          {/* Social proof - compact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8"
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

          {/* Explore more link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <a 
              href="#discover" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore trending looks
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
