/**
 * useAuth Hook
 * Path: src/shared/hooks/useAuth.ts
 * 
 * Wraps authService to provide auth functionality in components
 */

import authService from '@/features/auth/services/auth.service';
import { useState } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../../shared/types/api.types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Login wrapper
  const login = async (credentials: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('❌ Login error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Register wrapper
  const register = async (data: RegisterRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      console.error('❌ Register error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ IMPROVED: Logout wrapper - calls comprehensive service method
  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout(); // Calls comprehensive logout
      console.log('✅ Logout successful');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      console.error('❌ Logout error:', message);
      // Still return true to redirect even if error
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Get current user
  const getCurrentUser = () => authService.getCurrentUser();

  // ✅ Check if authenticated
  const isAuthenticated = () => authService.isAuthenticated();

  // ✅ Get user role
  const getUserRole = () => authService.getUserRole();

  return {
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated,
    getUserRole,
    isLoading,
    error,
    setError,
  };
}
