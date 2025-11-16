// import { createContext, ReactNode, useContext } from 'react';
// import { useOnboarding } from '../hooks/useOnboarding';

// type OnboardingContextType = ReturnType<typeof useOnboarding> | undefined;

// // Create the context
// export const OnboardingDataContext = createContext<OnboardingContextType>(undefined);

// // Set display name for debugging
// OnboardingDataContext.displayName = 'OnboardingDataContext';

// // ✅ PROVIDER COMPONENT (this was missing!)
// export function OnboardingProvider({ children }: { children: ReactNode }) {
//   const onboarding = useOnboarding();

//   return (
//     <OnboardingDataContext.Provider value={onboarding}>
//       {children}
//     </OnboardingDataContext.Provider>
//   );
// }

// // ✅ HOOK TO USE THE CONTEXT
// export function useOnboardingContext() {
//   const context = useContext(OnboardingDataContext);
//   if (!context) {
//     throw new Error('useOnboardingContext must be used within OnboardingProvider');
//   }
//   return context;
// }
