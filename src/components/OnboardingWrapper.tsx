import { useAuth } from '@/contexts/AuthContext';
import { useStylePreferences } from '@/hooks/useStylePreferences';
import { StyleOnboarding } from './StyleOnboarding';
import { AnimatePresence } from 'framer-motion';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { user } = useAuth();
  const { needsOnboarding, loading, skipOnboarding, refreshPreferences } = useStylePreferences();

  const handleComplete = () => {
    refreshPreferences();
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {user && !loading && needsOnboarding && (
          <StyleOnboarding onComplete={handleComplete} onSkip={handleSkip} />
        )}
      </AnimatePresence>
    </>
  );
}
