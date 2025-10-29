import authService from '@/services/auth.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/types/api.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Initial state
      user: authService.getCurrentUser(),
      isAuthenticated: authService.isAuthenticated(),
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Register action
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error: any) {
          set({ error: error });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Check authentication status
      checkAuth: () => {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        set({ user, isAuthenticated });
      },

      // Update user data
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;
