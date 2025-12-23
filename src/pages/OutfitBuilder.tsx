import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Heart, Share2, RotateCcw, Sparkles, Check, Link as LinkIcon } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OutfitItemCard } from "@/components/builder/OutfitItemCard";
import { AlternativeCard } from "@/components/builder/AlternativeCard";
import { SaveOutfitDialog } from "@/components/builder/SaveOutfitDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOutfitBuilder } from "@/hooks/useOutfitBuilder";
import { 
  SAMPLE_OUTFITS, 
  ALTERNATIVES, 
  type OutfitItemData,
  type Gender,
  CATEGORY_LABELS 
} from "@/lib/outfitData";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
];

export default function OutfitBuilder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const shareParam = searchParams.get("share");

  const {
    loadWardrobe,
    addToWardrobe,
    removeFromWardrobe,
    saveOutfit,
    generateShareUrl,
    parseShareUrl,
  } = useOutfitBuilder();

  const [gender, setGender] = useState<Gender>("women");
  const [outfitItems, setOutfitItems] = useState<OutfitItemData[]>(SAMPLE_OUTFITS.women);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [budget, setBudget] = useState([300]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [wardrobeLoaded, setWardrobeLoaded] = useState(false);

  // Load shared outfit from URL
  useEffect(() => {
    if (shareParam) {
      const shared = parseShareUrl(shareParam);
      if (shared) {
        setGender(shared.gender);
        setOutfitItems(shared.items);
        setBudget([shared.budget]);
        toast({
          title: "Shared outfit loaded",
          description: "You're viewing a shared outfit. Make it yours by customizing it!",
        });
      }
    }
  }, [shareParam, parseShareUrl, toast]);

  // Load user's wardrobe (locked items) on mount
  useEffect(() => {
    if (user && !wardrobeLoaded && !shareParam) {
      loadWardrobe().then((lockedItemIds) => {
        if (lockedItemIds.length > 0) {
          setOutfitItems((prev) =>
            prev.map((item) => ({
              ...item,
              isLocked: lockedItemIds.includes(item.id),
            }))
          );
        }
        setWardrobeLoaded(true);
      });
    }
  }, [user, wardrobeLoaded, loadWardrobe, shareParam]);

  // Update outfit when gender changes
  useEffect(() => {
    if (!shareParam) {
      setOutfitItems(SAMPLE_OUTFITS[gender]);
      setSelectedItemId(null);
      setWardrobeLoaded(false); // Reload wardrobe for new gender
    }
  }, [gender, shareParam]);

  const totalPrice = useMemo(() => {
    return outfitItems.reduce((sum, item) => sum + item.price, 0);
  }, [outfitItems]);

  const selectedItem = outfitItems.find((item) => item.id === selectedItemId);
  const alternatives = selectedItemId ? ALTERNATIVES[selectedItemId] || [] : [];

  const handleToggleLock = async (itemId: string) => {
    const item = outfitItems.find((i) => i.id === itemId);
    if (!item) return;

    const newLockedState = !item.isLocked;

    setOutfitItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, isLocked: newLockedState } : i
      )
    );

    // Persist to database if user is logged in
    if (user) {
      try {
        if (newLockedState) {
          await addToWardrobe(itemId, item);
        } else {
          await removeFromWardrobe(itemId);
        }
      } catch {
        // Revert on error
        setOutfitItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, isLocked: !newLockedState } : i
          )
        );
        toast({
          title: "Error",
          description: "Failed to update wardrobe",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: newLockedState ? "Item locked" : "Item unlocked",
      description: newLockedState 
        ? "This item is marked as owned" 
        : "This item can now be replaced",
    });
  };

  const handleSelectAlternative = (alternative: OutfitItemData) => {
    setOutfitItems((prev) =>
      prev.map((item) =>
        item.id === selectedItemId
          ? { ...alternative, id: item.id, isLocked: false }
          : item
      )
    );
    setSelectedItemId(null);
    toast({
      title: "Item replaced",
      description: `Swapped for ${alternative.name} by ${alternative.brand}`,
    });
  };

  const handleReset = () => {
    setOutfitItems(SAMPLE_OUTFITS[gender]);
    setSelectedItemId(null);
    setWardrobeLoaded(false);
    toast({
      title: "Outfit reset",
      description: "All items restored to original",
    });
  };

  const handleAskStylist = () => {
    const itemsList = outfitItems.map((i) => `${i.name} by ${i.brand}`).join(", ");
    navigate(`/stylist?q=${encodeURIComponent(`I have this outfit: ${itemsList}. Can you suggest improvements within €${budget[0]}?`)}`);
  };

  const handleSaveOutfit = async (name: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save outfits",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await saveOutfit(name, gender, outfitItems, totalPrice, budget[0]);
      toast({
        title: "Outfit saved!",
        description: "Find it in your Favorites",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save outfit",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = generateShareUrl(gender, outfitItems, budget[0]);
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link with friends",
      });
    } catch {
      // Fallback for browsers that don't support clipboard
      toast({
        title: "Share link",
        description: url,
      });
    }
  };

  const lockedCount = outfitItems.filter((i) => i.isLocked).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link 
                to="/explore" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </Link>
              <h1 className="text-3xl md:text-4xl font-serif">Outfit Builder</h1>
              <p className="text-muted-foreground mt-1">
                Customize your look — click items to swap, lock what you own
              </p>
              
              {/* Gender filter tabs */}
              <div className="flex gap-2 mt-4">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGender(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      gender === option.value
                        ? "bg-foreground text-background"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setSaveDialogOpen(true)}>
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button onClick={handleAskStylist} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Ask AI Stylist
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main outfit grid */}
            <div className="lg:col-span-2">
              {/* Budget slider */}
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Budget</h3>
                    <p className="text-sm text-muted-foreground">
                      Current total: <span className={totalPrice > budget[0] ? "text-destructive" : "text-green-600"}>€{totalPrice}</span> / €{budget[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif">€{budget[0]}</p>
                    {lockedCount > 0 && (
                      <p className="text-xs text-muted-foreground">{lockedCount} item{lockedCount > 1 ? "s" : ""} owned</p>
                    )}
                  </div>
                </div>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  min={50}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>€50</span>
                  <span>€500</span>
                </div>
              </div>

              {/* Outfit items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {outfitItems.map((item) => (
                  <OutfitItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => {
                      if (item.isLocked) {
                        toast({
                          title: "Item owned",
                          description: "Unlock this item to swap it",
                        });
                        return;
                      }
                      setSelectedItemId(selectedItemId === item.id ? null : item.id);
                    }}
                    onToggleLock={() => handleToggleLock(item.id)}
                  />
                ))}
              </div>

              {/* Shop all button */}
              <div className="mt-8 flex justify-center">
                <Button size="lg" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Shop Complete Look — €{totalPrice}
                </Button>
              </div>
            </div>

            {/* Replacement panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
                <h3 className="font-medium mb-4">
                  {selectedItem 
                    ? `Swap ${CATEGORY_LABELS[selectedItem.category]}` 
                    : "Alternatives"}
                </h3>

                <AnimatePresence mode="wait">
                  {selectedItem && alternatives.length > 0 ? (
                    <motion.div
                      key={selectedItemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Click to replace "{selectedItem.name}"
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {alternatives.map((alt) => (
                          <AlternativeCard
                            key={alt.id}
                            item={alt}
                            onSelect={() => handleSelectAlternative(alt)}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setSelectedItemId(null)}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Select an item from your outfit to see alternatives
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SaveOutfitDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveOutfit}
        totalPrice={totalPrice}
        itemCount={outfitItems.length}
      />
    </div>
  );
}
