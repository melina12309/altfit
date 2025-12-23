import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Heart, User, LogOut, Sparkles, Compass, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-tight">
          MUSE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/stylist" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI STYLIST
          </Link>
          <Link to="/builder" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            BUILDER
          </Link>
          <Link to="/explore" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            EXPLORE
          </Link>
          <a href="/#discover" className="text-sm editorial-spacing hover:text-muted-foreground transition-colors">
            DISCOVER
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          {user ? (
            <Button asChild variant="ghost" size="icon">
              <Link to="/favorites">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-muted-foreground text-xs">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="cursor-pointer">
                    <Heart className="w-4 h-4 mr-2" />
                    My Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}
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
              <Link
                to="/stylist"
                className="text-sm editorial-spacing py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                AI STYLIST
              </Link>
              <Link
                to="/builder"
                className="text-sm editorial-spacing py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wand2 className="w-4 h-4" />
                BUILDER
              </Link>
              <Link
                to="/explore"
                className="text-sm editorial-spacing py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Compass className="w-4 h-4" />
                EXPLORE
              </Link>
              <a
                href="/#discover"
                className="text-sm editorial-spacing py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                DISCOVER
              </a>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
                {user ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="ml-auto">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}