/**
 * Onboarding Guard Component
 * Redirects users to onboarding if they haven't completed it
 */

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  // If user is a seller and hasn't completed onboarding, redirect
  if (user?.role === "SELLER" && !user?.onboardingCompleted) {
    return <Navigate to="/seller/onboarding" replace />;
  }

  return <>{children}</>;
};
