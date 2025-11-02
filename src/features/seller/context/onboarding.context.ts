/**
 * Onboarding Context
 * Path: src/features/seller/context/onboarding.context.ts
 * 
 * Only exports context - no components
 */

import { createContext } from 'react';
import { OnboardingResponse } from '../types/onboarding.types';

export interface OnboardingDataContextType {
  onboarding: OnboardingResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const OnboardingDataContext = createContext<
  OnboardingDataContextType | undefined
>(undefined);

OnboardingDataContext.displayName = 'OnboardingDataContext';
