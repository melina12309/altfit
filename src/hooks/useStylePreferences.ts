import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StylePreferences {
  styles: string[];
  occasions: string[];
  colors: string[];
  onboarding_completed: boolean;
}

export function useStylePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<StylePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_style_preferences')
        .select('styles, occasions, colors, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        setNeedsOnboarding(true);
        setPreferences(null);
      } else {
        setPreferences(data);
        setNeedsOnboarding(!data.onboarding_completed);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Omit<StylePreferences, 'onboarding_completed'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_style_preferences')
        .upsert({
          user_id: user.id,
          styles: newPreferences.styles,
          occasions: newPreferences.occasions,
          colors: newPreferences.colors,
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving preferences:', error);
        return { error };
      }

      setPreferences({ ...newPreferences, onboarding_completed: true });
      setNeedsOnboarding(false);
      return { error: null };
    } catch (err) {
      console.error('Error saving preferences:', err);
      return { error: err as Error };
    }
  };

  const skipOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_style_preferences')
        .upsert({
          user_id: user.id,
          styles: [],
          occasions: [],
          colors: [],
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

      setNeedsOnboarding(false);
      setPreferences({ styles: [], occasions: [], colors: [], onboarding_completed: true });
    } catch (err) {
      console.error('Error skipping onboarding:', err);
    }
  };

  return {
    preferences,
    loading,
    needsOnboarding,
    savePreferences,
    skipOnboarding,
    refreshPreferences: loadPreferences,
  };
}
