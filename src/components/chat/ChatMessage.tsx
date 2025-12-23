import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { OutfitCard } from "./OutfitCard";
import { parseOutfitFromMessage, getTextWithoutOutfit } from "@/lib/styleChat";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const outfit = !isUser ? parseOutfitFromMessage(content) : null;
  const textContent = !isUser ? getTextWithoutOutfit(content) : content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary" : "bg-secondary"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Sparkles className="w-4 h-4 text-foreground" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 space-y-4 ${isUser ? "text-right" : ""}`}>
        {/* Text Message */}
        {textContent && (
          <div
            className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
              isUser
                ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                : "bg-secondary text-secondary-foreground rounded-bl-sm"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {textContent}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />
              )}
            </p>
          </div>
        )}

        {/* Outfit Card */}
        {outfit && !isStreaming && (
          <div className="max-w-lg">
            <OutfitCard outfit={outfit} />
          </div>
        )}
        
        {/* Show loading state while streaming outfit */}
        {!textContent && isStreaming && (
          <div className="inline-block bg-secondary text-secondary-foreground rounded-2xl rounded-bl-sm px-4 py-3">
            <p className="text-sm">
              Creating your look
              <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
