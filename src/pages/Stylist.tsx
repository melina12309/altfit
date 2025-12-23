import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { streamChat, type Message } from "@/lib/styleChat";
import { useToast } from "@/hooks/use-toast";

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Welcome to your personal styling session! I'm here to help you recreate iconic looks — from Emily in Paris to street style moments — all within your budget. Tell me what inspires you, or share a celebrity, show, or vibe you love. What are we creating today?",
};

export default function Stylist() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.content === userMessage.content) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    await streamChat({
      messages: [...messages.slice(1), userMessage], // Exclude welcome message from API
      onDelta: updateAssistant,
      onDone: () => setIsLoading(false),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <div className="w-16" /> {/* Spacer for centering */}
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
            <SuggestionChips onSelect={sendMessage} disabled={isLoading} />
          </motion.div>
        )}
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background border-t border-border p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-2xl">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your ideal look..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Try: "Met Gala look under €150" or "Carrie Bradshaw for the office"
          </p>
        </form>
      </footer>
    </div>
  );
}
