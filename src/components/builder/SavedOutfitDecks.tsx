import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Trash2, Eye, ChevronRight, Plus } from "lucide-react";
import { useOutfitBuilder, SavedOutfit } from "@/hooks/useOutfitBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OutfitItemData, Gender } from "@/lib/outfitData";

interface SavedOutfitDecksProps {
  onLoadOutfit: (outfit: SavedOutfit) => void;
  currentOutfitName?: string;
}

export function SavedOutfitDecks({ onLoadOutfit, currentOutfitName }: SavedOutfitDecksProps) {
  const { user } = useAuth();
  const { getSavedOutfits, deleteOutfit } = useOutfitBuilder();
  const { toast } = useToast();
  
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOutfits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOutfits = async () => {
    setLoading(true);
    const data = await getSavedOutfits();
    setOutfits(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteOutfit(deleteId);
      setOutfits((prev) => prev.filter((o) => o.id !== deleteId));
      toast({ title: "Outfit deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-6">
        <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sign in to save and manage outfit decks</p>
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

  if (outfits.length === 0) {
    return (
      <div className="text-center py-6">
        <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No saved outfits yet</p>
        <p className="text-xs text-muted-foreground">
          Save your current outfit using the heart button above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {outfits.map((outfit, index) => (
          <motion.div
            key={outfit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg border transition-all overflow-hidden ${
              currentOutfitName === outfit.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* Outfit Header */}
            <div
              onClick={() => setExpandedId(expandedId === outfit.id ? null : outfit.id)}
              className="p-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{outfit.name}</p>
                    {currentOutfitName === outfit.name && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{outfit.items.length} items</span>
                    <span>•</span>
                    <span>€{outfit.total_price}</span>
                    <span>•</span>
                    <span className="capitalize">{outfit.gender}</span>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                    expandedId === outfit.id ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedId === outfit.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  {/* Item Preview */}
                  <div className="p-3 flex gap-2 overflow-x-auto">
                    {outfit.items.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="shrink-0 w-12 h-12 rounded-lg bg-muted overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {outfit.items.length > 5 && (
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{outfit.items.length - 5}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onLoadOutfit(outfit)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(outfit.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="px-3 pb-3 text-xs text-muted-foreground">
                    Saved {formatDistanceToNow(new Date(outfit.created_at), { addSuffix: true })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
