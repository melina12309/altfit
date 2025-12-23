import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="font-serif text-2xl md:text-3xl tracking-tight">
          MUSE
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#discover" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors">
            DISCOVER
          </a>
          <a href="#how-it-works" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors">
            HOW IT WORKS
          </a>
          <a href="#collections" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors">
            COLLECTIONS
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="container py-6 flex flex-col gap-4">
              <a
                href="#discover"
                className="text-sm editorial-spacing py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                DISCOVER
              </a>
              <a
                href="#how-it-works"
                className="text-sm editorial-spacing py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                HOW IT WORKS
              </a>
              <a
                href="#collections"
                className="text-sm editorial-spacing py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                COLLECTIONS
              </a>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="sm" className="ml-auto">
                  Sign In
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
