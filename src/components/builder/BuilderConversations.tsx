import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronRight, Clock } from "lucide-react";
import { useChatHistory, Conversation } from "@/hooks/useChatHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface BuilderConversationsProps {
  onSelectConversation: (conversationId: string) => void;
}

export function BuilderConversations({ onSelectConversation }: BuilderConversationsProps) {
  const { user } = useAuth();
  const { getConversations } = useChatHistory();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    const data = await getConversations();
    setConversations(data.slice(0, 5)); // Show last 5 conversations
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sign in to see past conversations</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No past conversations yet</p>
        <button
          onClick={() => navigate("/stylist")}
          className="text-sm text-primary hover:underline"
        >
          Start chatting with AI Stylist →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <motion.button
          key={conv.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate(`/stylist?conversation=${conv.id}`)}
          className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{conv.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.preview}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}</span>
          </div>
        </motion.button>
      ))}
      
      <button
        onClick={() => navigate("/stylist")}
        className="w-full text-center py-2 text-sm text-primary hover:underline"
      >
        View all conversations →
      </button>
    </div>
  );
}
