/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Can be reused in React Native
 */

import { API_CONFIG, STORAGE_KEYS } from '@/config/api.config';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserRole
} from '@/types/api.types';
import { storage } from '@/utils/storage.util';
import { apiClient } from './api.client';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Determine role based on email
    let role: UserRole = 'SELLER'; // default
    const emailLower = credentials.email.toLowerCase();
    
    if (emailLower.includes('admin') || emailLower === 'admin@test.com') {
      role = 'ADMIN';
    } else if (emailLower.includes('seller') || emailLower === 'seller@test.com') {
      role = 'SELLER';
    } else if (emailLower.includes('buyer') || emailLower === 'buyer@test.com') {
      role = 'BUYER';
    } else if (emailLower.includes('3pl') || emailLower === '3pl@test.com') {
      role = '3PL';
    }

    // Create mock user with role-specific data
    const mockUser: User = {
      id: 'user_' + role.toLowerCase() + '_123',
      email: credentials.email,
      role,
      organizationId: 'org_' + role.toLowerCase() + '_456',
      organizationName: role === 'ADMIN' 
        ? 'Bulk Mandi Admin' 
        : role === 'SELLER'
        ? 'Seller'
        : role === 'BUYER'
        ? 'Buyer'
        : '3PL Logistics Ltd',
      mobile: '+919876543210',
      onboardingCompleted: role === 'ADMIN' ? true : true, // Admin doesn't need onboarding
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
      onboardingCompleted: data.role === 'ADMIN' ? true : false, // Admin doesn't need onboarding
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
