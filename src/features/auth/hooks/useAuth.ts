/**
 * useAuth Hook (Updated)
 * Wraps Zustand store - single source of truth
 */

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const store = useAuthStore();

  return {
    // State from store
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions from store
    login: store.login,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,

    // Helpers
    getCurrentUser: () => store.user,
    isUserRole: (role: string) => store.user?.role === role,
    navigateAfterLogout: () => {
      store.logout().then(() => {
        navigate('/auth/login', { replace: true });
      });
    },
  };
}
