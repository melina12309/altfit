import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Heart, Share2, RotateCcw, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OutfitItemCard } from "@/components/builder/OutfitItemCard";
import { AlternativeCard } from "@/components/builder/AlternativeCard";
import { useToast } from "@/hooks/use-toast";
import { 
  SAMPLE_OUTFIT, 
  ALTERNATIVES, 
  type OutfitItemData,
  CATEGORY_LABELS 
} from "@/lib/outfitData";

export default function OutfitBuilder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [outfitItems, setOutfitItems] = useState<OutfitItemData[]>(SAMPLE_OUTFIT);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [budget, setBudget] = useState([300]);

  const totalPrice = useMemo(() => {
    return outfitItems.reduce((sum, item) => sum + item.price, 0);
  }, [outfitItems]);

  const selectedItem = outfitItems.find((item) => item.id === selectedItemId);
  const alternatives = selectedItemId ? ALTERNATIVES[selectedItemId] || [] : [];

  const handleToggleLock = (itemId: string) => {
    setOutfitItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isLocked: !item.isLocked } : item
      )
    );
    const item = outfitItems.find((i) => i.id === itemId);
    toast({
      title: item?.isLocked ? "Item unlocked" : "Item locked",
      description: item?.isLocked 
        ? "This item can now be replaced" 
        : "This item is marked as owned",
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
    setOutfitItems(SAMPLE_OUTFIT);
    setSelectedItemId(null);
    toast({
      title: "Outfit reset",
      description: "All items restored to original",
    });
  };

  const handleAskStylist = () => {
    const itemsList = outfitItems.map((i) => `${i.name} by ${i.brand}`).join(", ");
    navigate(`/stylist?q=${encodeURIComponent(`I have this outfit: ${itemsList}. Can you suggest improvements within €${budget[0]}?`)}`);
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
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
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
                      <p className="text-xs text-muted-foreground">{lockedCount} item{lockedCount > 1 ? "s" : ""} locked</p>
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
                          title: "Item locked",
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
    </div>
  );
}
