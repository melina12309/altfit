import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { useToast } from "@/hooks/use-toast";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

// Mock outfit data - in a real app this would come from an API
const outfitsData: Record<string, { id: string; title: string; inspiration: string; image: string; priceRange: string; items: number }> = {
  "1": {
    id: "1",
    title: "The Power Look",
    inspiration: "Street Style",
    image: outfit1,
    priceRange: "$89 - $245",
    items: 5,
  },
  "2": {
    id: "2",
    title: "Urban Essential",
    inspiration: "Fashion Week",
    image: outfit2,
    priceRange: "$120 - $380",
    items: 4,
  },
  "3": {
    id: "3",
    title: "Evening Edit",
    inspiration: "Editorial",
    image: outfit3,
    priceRange: "$150 - $420",
    items: 3,
  },
};

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadFavorites();
    }
  }, [user, authLoading, navigate]);

  const loadFavorites = async () => {
    try {
      const favorites = await getFavorites();
      setFavoriteIds(favorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (outfitId: string) => {
    try {
      await removeFavorite(outfitId);
      setFavoriteIds((prev) => prev.filter((id) => id !== outfitId));
      toast({ title: "Removed from favorites" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const favoriteOutfits = favoriteIds
    .map((id) => outfitsData[id])
    .filter(Boolean);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Back navigation */}
        <div className="container py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* Header */}
        <section className="container pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs text-muted-foreground uppercase editorial-spacing mb-4 block">
              YOUR COLLECTION
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight mb-4">
              Saved
              <span className="block italic font-light">looks</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              {favoriteOutfits.length === 0
                ? "You haven't saved any looks yet. Start exploring and save your favorites!"
                : `You have ${favoriteOutfits.length} saved ${favoriteOutfits.length === 1 ? "look" : "looks"}`}
            </p>
          </motion.div>
        </section>

        {/* Favorites Grid */}
        <section className="border-t border-border">
          <div className="container py-16">
            {favoriteOutfits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="font-serif text-2xl mb-4">No saved looks yet</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Explore our curated collections and save the looks you love.
                </p>
                <Button asChild className="rounded-none bg-foreground text-background">
                  <Link to="/">Explore Looks</Link>
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteOutfits.map((outfit, index) => (
                  <motion.div
                    key={outfit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative bg-card border border-border hover:border-foreground/20 transition-all duration-300"
                  >
                    <Link to={`/outfit/${outfit.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={outfit.image}
                          alt={outfit.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pure-black/80 via-pure-black/20 to-transparent" />

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemove(outfit.id);
                          }}
                          className="absolute top-4 right-4 h-10 w-10 bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Saved indicator */}
                        <div className="absolute top-4 left-4 h-10 w-10 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                          <Heart className="w-4 h-4 fill-current text-red-500" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <p className="text-xs text-white/50 mb-1 uppercase editorial-spacing">
                            {outfit.inspiration}
                          </p>
                          <h3 className="font-serif text-xl mb-4">{outfit.title}</h3>
                          <div className="flex items-center justify-between border-t border-white/20 pt-4">
                            <span className="text-sm font-medium">{outfit.priceRange}</span>
                            <span className="text-xs text-white/50">{outfit.items} items</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}