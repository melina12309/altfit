import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "stylist" | "builder";
}

export function AuthPromptModal({ isOpen, onClose, feature }: AuthPromptModalProps) {
  const featureText = {
    stylist: {
      title: "Get Personalized Style Advice",
      description: "Sign in to save your conversations, get recommendations tailored to your preferences, and build your style profile.",
      icon: Sparkles,
    },
    builder: {
      title: "Build Your Perfect Outfit",
      description: "Sign in to save your outfits, sync your wardrobe across devices, and share your creations with friends.",
      icon: User,
    },
  };

  const { title, description, icon: Icon } = featureText[feature];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className="font-serif text-2xl mb-2">{title}</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/auth?mode=signup">
                    Create Account
                  </Link>
                </Button>
                
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Continue as guest
                </button>
              </div>

              {/* Benefits */}
              <div className="px-6 pb-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    ✨ Free to use • 💾 Save your progress • 🔒 Secure & private
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}