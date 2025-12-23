import { motion } from "framer-motion";

const suggestions = [
  "Emily in Paris office look",
  "Met Gala inspired under €100",
  "Casual Hailey Bieber vibes",
  "Italian summer aesthetic",
  "London street style",
  "Date night in Paris",
];

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
