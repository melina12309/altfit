import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw, Tv, Star, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSuggestions, type Suggestion } from "@/hooks/useSuggestions";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons = {
  tv: Tv,
  celebrities: Star,
  events: Calendar,
  vibes: TrendingUp,
};

const categoryColors = {
  tv: "from-indigo-500/20 to-violet-500/20",
  celebrities: "from-amber-500/20 to-orange-500/20",
  events: "from-emerald-500/20 to-teal-500/20",
  vibes: "from-pink-500/20 to-rose-500/20",
};

interface ForYouSectionProps {
  title?: string;
  showRefresh?: boolean;
}

export function ForYouSection({ title = "For You", showRefresh = true }: ForYouSectionProps) {
  const { suggestions, loading, hasData, error, refresh } = useSuggestions();

  // Don't show if user has no data to base suggestions on
  if (!loading && !hasData && suggestions.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error || suggestions.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-2xl">{title}</h2>
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
            Personalized
          </span>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard key={index} suggestion={suggestion} index={index} />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const Icon = categoryIcons[suggestion.category] || TrendingUp;
  const gradientClass = categoryColors[suggestion.category] || categoryColors.vibes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/stylist?q=${encodeURIComponent(`Show me ${suggestion.title} style looks`)}`}
        className={`group block p-5 rounded-xl border border-border bg-gradient-to-br ${gradientClass} hover:border-primary/30 transition-all`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors">
              {suggestion.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {suggestion.description}
            </p>
            <p className="text-xs text-primary/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {suggestion.reason}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 group-hover:text-primary transition-colors">
          <span>Explore</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}
