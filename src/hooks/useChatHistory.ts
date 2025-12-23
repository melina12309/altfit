import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/lib/styleChat";

export type Conversation = {
  id: string;
  title: string | null;
  preview: string | null;
  created_at: string;
  updated_at: string;
};

export function useChatHistory() {
  const { user } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const preview = firstMessage.slice(0, 100) + (firstMessage.length > 100 ? "..." : "");

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title,
        preview,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }

    setCurrentConversationId(data.id);
    return data.id;
  }, [user]);

  const saveMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    imageUrl?: string
  ) => {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        image_url: imageUrl,
      });

    if (error) {
      console.error("Failed to save message:", error);
    }

    // Update conversation preview and timestamp
    if (role === "user") {
      await supabase
        .from("chat_conversations")
        .update({
          preview: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }
  }, []);

  const updateAssistantMessage = useCallback(async (
    conversationId: string,
    content: string
  ) => {
    // Get the last assistant message for this conversation
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("role", "assistant")
      .order("created_at", { ascending: false })
      .limit(1);

    if (messages && messages.length > 0) {
      await supabase
        .from("chat_messages")
        .update({ content })
        .eq("id", messages[0].id);
    }
  }, []);

  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load conversations:", error);
      return [];
    }

    return data || [];
  }, [user]);

  const getConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load messages:", error);
      return [];
    }

    return (data || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      image: msg.image_url || undefined,
    }));
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  }, []);

  return {
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    saveMessage,
    updateAssistantMessage,
    getConversations,
    getConversationMessages,
    deleteConversation,
  };
}
