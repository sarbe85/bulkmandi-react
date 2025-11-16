// COPY EXACTLY FROM: seller/hooks/useOnboardingData.ts
// No changes needed

import { useContext } from 'react';
import { OnboardingDataContext, OnboardingDataContextType } from '../context/onboarding.context';

export function useOnboardingData(): OnboardingDataContextType {
  const context = useContext(OnboardingDataContext);
  if (!context) {
    throw new Error('useOnboardingData must be used within BuyerLayout');
  }
  return context;
}
