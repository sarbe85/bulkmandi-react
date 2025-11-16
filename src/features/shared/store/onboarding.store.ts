// ============================================
// UNIFIED ZUSTAND STORE (ALL ROLES)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingResponse } from '../types/onboarding.types';

interface OnboardingState {
  // Data
  data: OnboardingResponse | null;
  
  // UI States
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  setData: (data: OnboardingResponse) => void;
  updateData: (partial: Partial<OnboardingResponse>) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      data: null,
      isLoading: false,
      isSaving: false,
      error: null,

      setData: (data) => set({ data, error: null }),
      
      updateData: (partial) =>
        set((state) => ({
          data: state.data ? { ...state.data, ...partial } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      
      setSaving: (saving) => set({ isSaving: saving }),
      
      setError: (error) => set({ error }),
      
      reset: () =>
        set({
          data: null,
          isLoading: false,
          isSaving: false,
          error: null,
        }),
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
