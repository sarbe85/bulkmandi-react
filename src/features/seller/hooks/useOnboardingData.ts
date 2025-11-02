/**
 * Onboarding Data Hook
 * Path: src/features/seller/hooks/useOnboardingData.ts
 * 
 * Only exports hook - no components
 */

import { useContext } from 'react';
import {
  OnboardingDataContext,
  OnboardingDataContextType,
} from '../context/onboarding.context';

export function useOnboardingData(): OnboardingDataContextType {
  const context = useContext(OnboardingDataContext);
  if (!context) {
    throw new Error(
      'useOnboardingData must be used within SellerLayout'
    );
  }
  return context;
}
