import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Suggestion = {
  title: string;
  description: string;
  reason: string;
  category: "tv" | "celebrities" | "events" | "vibes";
};

export type SuggestionFeedback = {
  suggestion_title: string;
  feedback_type: "saved" | "dismissed";
};

export function useSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's feedback history
  const loadFeedback = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("suggestion_feedback")
      .select("suggestion_title, feedback_type")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load feedback:", error);
      return;
    }

    const saved = data?.filter(f => f.feedback_type === "saved").map(f => f.suggestion_title) || [];
    const dismissed = data?.filter(f => f.feedback_type === "dismissed").map(f => f.suggestion_title) || [];
    
    setSavedSuggestions(saved);
    setDismissedSuggestions(dismissed);
  }, [user]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/style-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setError("Rate limited, try again later");
        } else if (response.status === 402) {
          setError("AI credits exhausted");
        } else {
          setError("Failed to load suggestions");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Filter out dismissed suggestions
      const filteredSuggestions = (data.suggestions || []).filter(
        (s: Suggestion) => !dismissedSuggestions.includes(s.title)
      );
      
      setSuggestions(filteredSuggestions);
      setHasData(data.hasData || false);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setError("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [user, dismissedSuggestions]);

  // Save a suggestion (like it)
  const saveSuggestion = useCallback(async (suggestion: Suggestion) => {
    if (!user) return;

    const { error } = await supabase
      .from("suggestion_feedback")
      .upsert([{
        user_id: user.id,
        suggestion_title: suggestion.title,
        suggestion_category: suggestion.category,
        feedback_type: "saved",
      }], { onConflict: "user_id,suggestion_title" });

    if (error) {
      console.error("Failed to save suggestion:", error);
      throw error;
    }

    setSavedSuggestions(prev => [...prev, suggestion.title]);
  }, [user]);

  // Dismiss a suggestion (hide it)
  const dismissSuggestion = useCallback(async (suggestion: Suggestion) => {
    if (!user) return;

    const { error } = await supabase
      .from("suggestion_feedback")
      .upsert([{
        user_id: user.id,
        suggestion_title: suggestion.title,
        suggestion_category: suggestion.category,
        feedback_type: "dismissed",
      }], { onConflict: "user_id,suggestion_title" });

    if (error) {
      console.error("Failed to dismiss suggestion:", error);
      throw error;
    }

    setDismissedSuggestions(prev => [...prev, suggestion.title]);
    setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  }, [user]);

  // Undo dismiss
  const undoDismiss = useCallback(async (suggestionTitle: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("suggestion_feedback")
      .delete()
      .eq("user_id", user.id)
      .eq("suggestion_title", suggestionTitle);

    if (error) {
      console.error("Failed to undo dismiss:", error);
      throw error;
    }

    setDismissedSuggestions(prev => prev.filter(t => t !== suggestionTitle));
  }, [user]);

  // Load feedback on mount
  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Fetch suggestions after feedback is loaded
  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user, dismissedSuggestions.length]);

  return {
    suggestions,
    savedSuggestions,
    dismissedSuggestions,
    loading,
    hasData,
    error,
    refresh: fetchSuggestions,
    saveSuggestion,
    dismissSuggestion,
    undoDismiss,
    isSaved: (title: string) => savedSuggestions.includes(title),
  };
}
