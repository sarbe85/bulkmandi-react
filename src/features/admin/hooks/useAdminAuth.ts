/**
 * useAuth Hook
 * Path: src/shared/hooks/useAuth.ts
 */

import authService from '@/features/auth/services/auth.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/shared/types/api.types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // ✅ Returns AuthResponse with user.role
      const response = await authService.login(credentials);
      return response; // ✅ Return full response
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
  };
}
