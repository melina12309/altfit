import { motion } from "framer-motion";
import { MessageSquare, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@/hooks/useChatHistory";

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  selectedId?: string | null;
}

export function ConversationList({
  conversations,
  onSelect,
  onDelete,
  onNewChat,
  selectedId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <button
          onClick={onNewChat}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Start a new chat
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-3 p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">New conversation</span>
      </button>

      {conversations.map((conversation, index) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
            selectedId === conversation.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-foreground/20"
          }`}
          onClick={() => onSelect(conversation.id)}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {conversation.title || "Untitled conversation"}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {conversation.preview || "No messages"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded transition-all"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
