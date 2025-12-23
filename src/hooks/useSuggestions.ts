import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Suggestion = {
  title: string;
  description: string;
  reason: string;
  category: "tv" | "celebrities" | "events" | "vibes";
};

export function useSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setSuggestions(data.suggestions || []);
      setHasData(data.hasData || false);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setError("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    hasData,
    error,
    refresh: fetchSuggestions,
  };
}
