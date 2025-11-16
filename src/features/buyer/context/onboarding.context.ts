// COPY EXACTLY FROM: seller/context/onboarding.context.ts
// No changes needed

import { createContext } from 'react';
import type { OnboardingResponse } from '../types/onboarding.types';

export interface OnboardingDataContextType {
  onboarding: OnboardingResponse | null;
  isLoading: boolean;
  error: string | null;
  silentRefresh: () => Promise<void>;
}

export const OnboardingDataContext = createContext<OnboardingDataContextType | undefined>(undefined);
OnboardingDataContext.displayName = 'OnboardingDataContext';
