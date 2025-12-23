import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStylePreferences } from '@/hooks/useStylePreferences';
import { useToast } from '@/hooks/use-toast';

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

interface StyleOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StyleOnboarding({ onComplete, onSkip }: StyleOnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  const { savePreferences } = useStylePreferences();
  const { toast } = useToast();

  const toggleSelection = (id: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleComplete = async () => {
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
      setSaving(false);
      return;
    }

    toast({
      title: "Preferences saved!",
      description: "We'll personalize your recommendations",
    });
    onComplete();
  };

  const steps = [
    {
      title: "What's your style?",
      subtitle: "Select all that resonate with you",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {STYLE_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => toggleSelection(option.id, selectedStyles, setSelectedStyles)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                selectedStyles.includes(option.id)
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="font-medium text-sm">{option.label}</span>
              {selectedStyles.includes(option.id) && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Where do you dress up for?",
      subtitle: "Help us understand your lifestyle",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {OCCASION_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => toggleSelection(option.id, selectedOccasions, setSelectedOccasions)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                selectedOccasions.includes(option.id)
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="font-medium text-sm">{option.label}</span>
              {selectedOccasions.includes(option.id) && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Pick your color palette",
      subtitle: "Choose colors you love to wear",
      content: (
        <div className="grid grid-cols-2 gap-4">
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
                    className="w-6 h-6 rounded-full border border-border/50"
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
      ),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 ? selectedStyles.length > 0 : 
                     step === 1 ? selectedOccasions.length > 0 : 
                     selectedColors.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Style Preferences</span>
          </div>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-foreground mb-1">
                {currentStep.title}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {currentStep.subtitle}
              </p>
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => step > 0 ? setStep(step - 1) : onSkip()}
            disabled={saving}
          >
            {step > 0 ? (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            ) : (
              'Skip for now'
            )}
          </Button>

          <Button
            onClick={() => isLastStep ? handleComplete() : setStep(step + 1)}
            disabled={!canProceed || saving}
          >
            {saving ? (
              'Saving...'
            ) : isLastStep ? (
              <>
                Complete
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
