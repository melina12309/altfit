import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Trash2, MessageSquare, ShoppingBag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ForYouSection } from "@/components/ForYouSection";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { useChatHistory, type Conversation } from "@/hooks/useChatHistory";
import { useOutfitBuilder, type SavedOutfit } from "@/hooks/useOutfitBuilder";
import { ConversationList } from "@/components/chat/ConversationList";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getConversations, deleteConversation } = useChatHistory();
  const { getSavedOutfits, deleteOutfit, generateShareUrl } = useOutfitBuilder();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [favorites, convos, outfits] = await Promise.all([
        getFavorites(),
        getConversations(),
        getSavedOutfits(),
      ]);
      setFavoriteIds(favorites);
      setConversations(convos);
      setSavedOutfits(outfits);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (outfitId: string) => {
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

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      toast({ title: "Conversation deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await deleteOutfit(outfitId);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));
      toast({ title: "Outfit deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete outfit",
        variant: "destructive",
      });
    }
  };

  const handleShareOutfit = async (outfit: SavedOutfit) => {
    const url = generateShareUrl(outfit.gender, outfit.items, outfit.budget || 300);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link with friends",
      });
    } catch {
      toast({
        title: "Share link",
        description: url,
      });
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/stylist?conversation=${conversationId}`);
  };

  const handleNewChat = () => {
    navigate("/stylist");
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
              <span className="block italic font-light">& history</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              Your saved looks, custom outfits, and past styling conversations.
            </p>
          </motion.div>
        </section>

        {/* For You Section */}
        <section className="container pb-8">
          <ForYouSection title="Suggested for you" />
        </section>

        {/* Tabs */}
        <section className="border-t border-border">
          <div className="container py-8">
            <Tabs defaultValue="outfits" className="w-full">
              <TabsList className="grid w-full max-w-lg grid-cols-3 mb-8">
                <TabsTrigger value="outfits" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Outfits
                  {savedOutfits.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {savedOutfits.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chats
                  {conversations.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {conversations.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Likes
                  {favoriteOutfits.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {favoriteOutfits.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Saved Outfits Tab */}
              <TabsContent value="outfits">
                {savedOutfits.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                    <h2 className="font-serif text-2xl mb-4">No saved outfits yet</h2>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      Build and save custom outfits in the Outfit Builder.
                    </p>
                    <Button asChild className="rounded-none bg-foreground text-background">
                      <Link to="/builder">Open Outfit Builder</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedOutfits.map((outfit, index) => (
                      <motion.div
                        key={outfit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 transition-all"
                      >
                        {/* Outfit items preview */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-serif text-lg truncate">{outfit.name}</h3>
                            <span className="text-xs text-muted-foreground capitalize">{outfit.gender}</span>
                          </div>
                          
                          {/* Item thumbnails */}
                          <div className="flex gap-1 mb-4">
                            {outfit.items.slice(0, 5).map((item, idx) => (
                              <div
                                key={idx}
                                className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {outfit.items.length > 5 && (
                              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                +{outfit.items.length - 5}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">€{outfit.total_price}</span>
                            <span className="text-muted-foreground text-xs">
                              {outfit.items.length} items
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(outfit.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-border p-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleShareOutfit(outfit)}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteOutfit(outfit.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Conversations Tab */}
              <TabsContent value="conversations">
                <div className="max-w-2xl">
                  <ConversationList
                    conversations={conversations}
                    onSelect={handleSelectConversation}
                    onDelete={handleDeleteConversation}
                    onNewChat={handleNewChat}
                  />
                </div>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites">
                {favoriteOutfits.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                    <h2 className="font-serif text-2xl mb-4">No liked looks yet</h2>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      Explore our curated collections and like the looks you love.
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
                                handleRemoveFavorite(outfit.id);
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
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
