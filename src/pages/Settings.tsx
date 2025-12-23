import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useStylePreferences } from '@/hooks/useStylePreferences';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const STYLE_OPTIONS = [
  { id: 'minimalist', label: 'Minimalist', emoji: '🤍' },
  { id: 'streetwear', label: 'Streetwear', emoji: '🔥' },
  { id: 'classic', label: 'Classic', emoji: '👔' },
  { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
  { id: 'sporty', label: 'Sporty', emoji: '⚡' },
  { id: 'glamorous', label: 'Glamorous', emoji: '✨' },
  { id: 'vintage', label: 'Vintage', emoji: '🕰️' },
  { id: 'edgy', label: 'Edgy', emoji: '🖤' },
];

const OCCASION_OPTIONS = [
  { id: 'everyday', label: 'Everyday Casual', emoji: '☕' },
  { id: 'work', label: 'Work/Office', emoji: '💼' },
  { id: 'date-night', label: 'Date Night', emoji: '💕' },
  { id: 'party', label: 'Party/Events', emoji: '🎉' },
  { id: 'weekend', label: 'Weekend Vibes', emoji: '🌴' },
  { id: 'formal', label: 'Formal Events', emoji: '🥂' },
];

const COLOR_OPTIONS = [
  { id: 'neutrals', label: 'Neutrals', colors: ['#F5F5DC', '#D3D3D3', '#000000', '#FFFFFF'] },
  { id: 'earth', label: 'Earth Tones', colors: ['#8B4513', '#556B2F', '#CD853F', '#A0522D'] },
  { id: 'pastels', label: 'Pastels', colors: ['#FFB6C1', '#E6E6FA', '#98FB98', '#87CEEB'] },
  { id: 'bold', label: 'Bold Colors', colors: ['#FF0000', '#0000FF', '#FFD700', '#FF00FF'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#FFFFFF'] },
  { id: 'jewel', label: 'Jewel Tones', colors: ['#4B0082', '#006400', '#8B0000', '#00008B'] },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { preferences, loading, savePreferences } = useStylePreferences();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (preferences) {
      setSelectedStyles(preferences.styles || []);
      setSelectedOccasions(preferences.occasions || []);
      setSelectedColors(preferences.colors || []);
    }
  }, [preferences]);

  useEffect(() => {
    if (!preferences) return;
    
    const stylesChanged = JSON.stringify(selectedStyles.sort()) !== JSON.stringify((preferences.styles || []).sort());
    const occasionsChanged = JSON.stringify(selectedOccasions.sort()) !== JSON.stringify((preferences.occasions || []).sort());
    const colorsChanged = JSON.stringify(selectedColors.sort()) !== JSON.stringify((preferences.colors || []).sort());
    
    setHasChanges(stylesChanged || occasionsChanged || colorsChanged);
  }, [selectedStyles, selectedOccasions, selectedColors, preferences]);

  const toggleSelection = (id: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await savePreferences({
      styles: selectedStyles,
      occasions: selectedOccasions,
      colors: selectedColors,
    });

    if (error) {
      toast({
        title: "Couldn't save preferences",
        description: "Please try again",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Preferences saved!",
        description: "Your recommendations will be updated",
      });
      setHasChanges(false);
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your style preferences</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Style Preferences Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Style Preferences</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Select styles that resonate with you for better recommendations
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STYLE_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => toggleSelection(option.id, selectedStyles, setSelectedStyles)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        selectedStyles.includes(option.id)
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="font-medium text-xs">{option.label}</span>
                      {selectedStyles.includes(option.id) && (
                        <Check className="w-3 h-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Occasions Section */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Occasions</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  What occasions do you usually dress for?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OCCASION_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => toggleSelection(option.id, selectedOccasions, setSelectedOccasions)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                        selectedOccasions.includes(option.id)
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="font-medium text-sm">{option.label}</span>
                      {selectedOccasions.includes(option.id) && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Colors Section */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Color Palettes</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Choose colors you love to wear
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {COLOR_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => toggleSelection(option.id, selectedColors, setSelectedColors)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedColors.includes(option.id)
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex gap-1 mb-2 justify-center">
                        {option.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-border/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-sm">{option.label}</span>
                        {selectedColors.includes(option.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Save Button */}
              <div className="sticky bottom-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
