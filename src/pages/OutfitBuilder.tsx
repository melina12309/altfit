import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Heart, Share2, RotateCcw, Sparkles, MessageSquare, Layers, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OutfitItemCard } from "@/components/builder/OutfitItemCard";
import { AlternativeCard } from "@/components/builder/AlternativeCard";
import { SaveOutfitDialog } from "@/components/builder/SaveOutfitDialog";
import { BuilderConversations } from "@/components/builder/BuilderConversations";
import { BuilderSuggestions } from "@/components/builder/BuilderSuggestions";
import { SavedOutfitDecks } from "@/components/builder/SavedOutfitDecks";
import { ProductSearch } from "@/components/builder/ProductSearch";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOutfitBuilder, SavedOutfit } from "@/hooks/useOutfitBuilder";
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

type SidebarTab = "suggestions" | "conversations" | "decks" | "search";

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
  const [currentOutfitName, setCurrentOutfitName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>("search");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [hasSeenAuthPrompt, setHasSeenAuthPrompt] = useState(() => {
    return sessionStorage.getItem("builder_auth_prompt_seen") === "true";
  });

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

  // Show auth prompt for first-time unauthenticated users
  useEffect(() => {
    if (!user && !hasSeenAuthPrompt) {
      const timer = setTimeout(() => {
        setShowAuthPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenAuthPrompt]);

  const handleCloseAuthPrompt = () => {
    setShowAuthPrompt(false);
    setHasSeenAuthPrompt(true);
    sessionStorage.setItem("builder_auth_prompt_seen", "true");
  };

  // Update outfit when gender changes
  useEffect(() => {
    if (!shareParam) {
      setOutfitItems(SAMPLE_OUTFITS[gender]);
      setSelectedItemId(null);
      setWardrobeLoaded(false);
      setCurrentOutfitName(null);
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

    if (user) {
      try {
        if (newLockedState) {
          await addToWardrobe(itemId, item);
        } else {
          await removeFromWardrobe(itemId);
        }
      } catch {
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
    setCurrentOutfitName(null);
    toast({
      title: "Item replaced",
      description: `Swapped for ${alternative.name} by ${alternative.brand}`,
    });
  };

  const handleReset = () => {
    setOutfitItems(SAMPLE_OUTFITS[gender]);
    setSelectedItemId(null);
    setWardrobeLoaded(false);
    setCurrentOutfitName(null);
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
      setCurrentOutfitName(name);
      toast({
        title: "Outfit saved!",
        description: "Find it in your Saved Decks",
      });
      // Switch to decks tab to show the saved outfit
      setActiveTab("decks");
    } catch {
      toast({
        title: "Error",
        description: "Failed to save outfit",
        variant: "destructive",
      });
    }
  };

  const handleLoadOutfit = (outfit: SavedOutfit) => {
    setGender(outfit.gender);
    setOutfitItems(outfit.items);
    setBudget([outfit.budget || 300]);
    setCurrentOutfitName(outfit.name);
    setSelectedItemId(null);
    toast({
      title: `Loaded "${outfit.name}"`,
      description: "Customize it further or save as new",
    });
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
      toast({
        title: "Share link",
        description: url,
      });
    }
  };

  const lockedCount = outfitItems.filter((i) => i.isLocked).length;
  const currentOutfitIds = useMemo(() => outfitItems.map((i) => i.id), [outfitItems]);

  const handleAddProductToOutfit = useCallback((item: OutfitItemData) => {
    // Check if we already have an item in this category
    const existingCategoryItem = outfitItems.find((i) => i.category === item.category);
    
    if (existingCategoryItem) {
      // Replace the existing item in that category
      setOutfitItems((prev) =>
        prev.map((i) => (i.category === item.category ? { ...item, isLocked: false } : i))
      );
      toast({
        title: "Item replaced",
        description: `Swapped ${existingCategoryItem.name} for ${item.name}`,
      });
    } else {
      // Add as new item
      setOutfitItems((prev) => [...prev, { ...item, isLocked: false }]);
      toast({
        title: "Item added",
        description: `Added ${item.name} to your outfit`,
      });
    }
    setCurrentOutfitName(null);
  }, [outfitItems, toast]);

  const tabs = [
    { id: "search" as SidebarTab, label: "Browse", icon: Search },
    { id: "decks" as SidebarTab, label: "Saved", icon: Layers },
    { id: "suggestions" as SidebarTab, label: "For You", icon: Sparkles },
    { id: "conversations" as SidebarTab, label: "Chats", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={handleCloseAuthPrompt}
        feature="builder"
      />

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
              <h1 className="text-3xl md:text-4xl font-serif">
                {currentOutfitName || "Outfit Builder"}
              </h1>
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

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main outfit grid */}
            <div className="lg:col-span-3">
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

              {/* Alternatives panel */}
              <AnimatePresence>
                {selectedItem && alternatives.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">
                          Swap {CATEGORY_LABELS[selectedItem.category]}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Click to replace "{selectedItem.name}"
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItemId(null)}>
                        Cancel
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {alternatives.map((alt) => (
                        <AlternativeCard
                          key={alt.id}
                          item={alt}
                          onSelect={() => handleSelectAlternative(alt)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shop all button */}
              <div className="mt-8 flex justify-center">
                <Button size="lg" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Shop Complete Look — €{totalPrice}
                </Button>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarExpanded(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Toggle button for mobile */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground lg:hidden border-b border-border"
                >
                  {sidebarExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Expand
                    </>
                  )}
                </button>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  {sidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={activeTab === "search" ? "h-[60vh]" : "p-4 max-h-[60vh] overflow-y-auto"}
                    >
                      {activeTab === "search" && (
                        <ProductSearch
                          gender={gender}
                          onAddToOutfit={handleAddProductToOutfit}
                          currentOutfitIds={currentOutfitIds}
                        />
                      )}
                      {activeTab === "decks" && (
                        <SavedOutfitDecks 
                          onLoadOutfit={handleLoadOutfit}
                          currentOutfitName={currentOutfitName || undefined}
                        />
                      )}
                      {activeTab === "suggestions" && <BuilderSuggestions />}
                      {activeTab === "conversations" && (
                        <BuilderConversations onSelectConversation={() => {}} />
                      )}
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
        defaultName={currentOutfitName || undefined}
      />
    </div>
  );
}
