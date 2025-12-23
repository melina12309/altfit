import { motion } from "framer-motion";
import { Sparkles, Heart, X, ChevronRight } from "lucide-react";
import { useSuggestions, Suggestion } from "@/hooks/useSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function BuilderSuggestions() {
  const { user } = useAuth();
  const { suggestions, loading, hasData, saveSuggestion, dismissSuggestion, isSaved } = useSuggestions();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="text-center py-6">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sign in to see personalized suggestions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!hasData || suggestions.length === 0) {
    return (
      <div className="text-center py-6">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          {!hasData ? "Start exploring to get personalized suggestions" : "No suggestions available"}
        </p>
        <button
          onClick={() => navigate("/stylist")}
          className="text-sm text-primary hover:underline"
        >
          Chat with AI Stylist →
        </button>
      </div>
    );
  }

  const handleSave = async (suggestion: Suggestion) => {
    try {
      await saveSuggestion(suggestion);
      toast({ title: "Saved!", description: "Added to your style preferences" });
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDismiss = async (suggestion: Suggestion) => {
    try {
      await dismissSuggestion(suggestion);
    } catch {
      toast({ title: "Error", description: "Failed to dismiss", variant: "destructive" });
    }
  };

  const handleExplore = (suggestion: Suggestion) => {
    navigate(`/stylist?q=${encodeURIComponent(`Show me outfits inspired by ${suggestion.title}: ${suggestion.description}`)}`);
  };

  return (
    <div className="space-y-2">
      {suggestions.slice(0, 4).map((suggestion, index) => (
        <motion.div
          key={suggestion.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => handleExplore(suggestion)}
            >
              <p className="font-medium text-sm">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{suggestion.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSave(suggestion)}
                className={`p-1.5 rounded-full transition-colors ${
                  isSaved(suggestion.title) 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved(suggestion.title) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => handleDismiss(suggestion)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => handleExplore(suggestion)}
            className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
          >
            Explore this style
            <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
