/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Can be reused in React Native
 */

import { apiClient } from './api.client';
import { API_CONFIG, STORAGE_KEYS } from '@/config/api.config';
import { storage } from '@/utils/storage.util';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User 
} from '@/types/api.types';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: 'user_123',
      email: credentials.email,
      role: 'SELLER',
      organizationId: 'org_456',
      organizationName: 'Steel Manufacturing Ltd',
      mobile: '+919876543210',
      onboardingCompleted: true, // Mock user has completed onboarding
      createdAt: new Date().toISOString()
    };

    const mockToken = 'mock_access_token_' + Date.now();
    
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

    return {
      accessToken: mockToken,
      user: mockUser,
    };
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: 'user_' + Date.now(),
      email: data.email,
      role: data.role,
      organizationId: 'org_' + Date.now(),
      organizationName: data.organizationName,
      mobile: data.mobile,
      onboardingCompleted: false, // New users need onboarding
      createdAt: new Date().toISOString()
    };

    const mockToken = 'mock_access_token_' + Date.now();
    
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

    return {
      accessToken: mockToken,
      user: mockUser,
    };
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear storage
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER);
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: (): User | null => {
    return storage.getItem<User>(STORAGE_KEYS.USER);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },
};

/**
 * Usage Example:
 * 
 * import { authService } from '@/services/auth.service';
 * 
 * // Login
 * const authData = await authService.login({
 *   email: 'seller@example.com',
 *   password: 'password123'
 * });
 * 
 * // Check auth status
 * const isLoggedIn = authService.isAuthenticated();
 * 
 * // Logout
 * await authService.logout();
 */
