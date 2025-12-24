import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Sparkles, ImagePlus, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { streamChat, fileToBase64, type Message } from "@/lib/styleChat";
import { useToast } from "@/hooks/use-toast";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useAuth } from "@/contexts/AuthContext";

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Welcome to your personal styling session! I'm here to help you recreate iconic looks — from Emily in Paris to street style moments — all within your budget. Tell me what inspires you, share a celebrity, show, or vibe you love, or **upload a photo** of an outfit you'd like to recreate. What are we creating today?",
};

export default function Stylist() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q");
  const conversationIdParam = searchParams.get("conversation");
  
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessedInitial, setHasProcessedInitial] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [hasSeenAuthPrompt, setHasSeenAuthPrompt] = useState(() => {
    return sessionStorage.getItem("stylist_auth_prompt_seen") === "true";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    saveMessage,
    updateAssistantMessage,
    getConversationMessages,
  } = useChatHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show auth prompt for first-time unauthenticated users
  useEffect(() => {
    if (!user && !hasSeenAuthPrompt) {
      const timer = setTimeout(() => {
        setShowAuthPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenAuthPrompt]);

  const handleCloseAuthPrompt = () => {
    setShowAuthPrompt(false);
    setHasSeenAuthPrompt(true);
    sessionStorage.setItem("stylist_auth_prompt_seen", "true");
  };

  // Load conversation from URL param if present
  useEffect(() => {
    if (conversationIdParam && user) {
      loadConversation(conversationIdParam);
    }
  }, [conversationIdParam, user]);

  const loadConversation = async (conversationId: string) => {
    const loadedMessages = await getConversationMessages(conversationId);
    if (loadedMessages.length > 0) {
      setMessages([WELCOME_MESSAGE, ...loadedMessages]);
      setCurrentConversationId(conversationId);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      setImageFile(file);
    } catch {
      toast({
        title: "Failed to load image",
        description: "Please try again with a different image",
        variant: "destructive",
      });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (text: string, image?: string) => {
    if ((!text.trim() && !image) || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      content: text.trim() || "Please analyze this outfit and suggest affordable alternatives.",
      image: image
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    clearImage();
    setIsLoading(true);

    // Create or use existing conversation
    let convId = currentConversationId;
    if (!convId && user) {
      convId = await createConversation(userMessage.content);
    }

    // Save user message to database
    if (convId && user) {
      await saveMessage(convId, "user", userMessage.content, userMessage.image);
    }

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    // Create placeholder for assistant message in database
    if (convId && user) {
      await saveMessage(convId, "assistant", "...");
    }

    await streamChat({
      messages: [...messages.slice(1), userMessage],
      onDelta: updateAssistant,
      onDone: async () => {
        setIsLoading(false);
        // Update the final assistant message in database
        if (convId && user && assistantContent) {
          await updateAssistantMessage(convId, assistantContent);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Something went wrong",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  // Auto-send initial query from URL
  useEffect(() => {
    if (initialQuery && !hasProcessedInitial) {
      setHasProcessedInitial(true);
      sendMessage(initialQuery);
    }
  }, [initialQuery, hasProcessedInitial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, selectedImage || undefined);
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={handleCloseAuthPrompt}
        feature="stylist"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg">Style Assistant</span>
          </div>
          <Link 
            to="/favorites" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            History
          </Link>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              image={message.image}
              isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <p className="text-center text-sm text-muted-foreground mb-4">
              Try one of these to get started
            </p>
            <SuggestionChips onSelect={(text) => sendMessage(text)} disabled={isLoading} />
          </motion.div>
        )}
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="container mx-auto max-w-2xl">
          {/* Image preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 relative inline-block"
              >
                <img
                  src={selectedImage}
                  alt="Selected outfit"
                  className="h-20 w-20 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {/* Image upload button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <ImagePlus className="w-4 h-4" />
              </Button>

              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Describe what you like about this outfit..." : "Describe your ideal look..."}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Upload an outfit photo or try: "Met Gala look under €150"
            </p>
          </form>
        </div>
      </footer>
    </div>
  );
}
