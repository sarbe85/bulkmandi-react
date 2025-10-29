/**
 * Authentication Hook
 * Custom hook for authentication operations
 * Provides a clean interface to the auth store
 */

import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    clearError,
  };
};
