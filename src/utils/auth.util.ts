/**
 * Auth Utility Functions
 * Helper functions for role-based access control
 */

import { STORAGE_KEYS } from '@/config/api.config';
import { UserRole } from '@/shared/types/api.types';
import { storage } from '@/utils/storage.util';

export const authUtil = {
  /**
   * Get current user from storage
   */
  getCurrentUser: () => {
    return storage.getItem<{ role: UserRole }>(STORAGE_KEYS.USER);
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: UserRole): boolean => {
    const user = authUtil.getCurrentUser();
    return user?.role === role;
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return authUtil.hasRole('ADMIN');
  },

  /**
   * Check if user is seller
   */
  isSeller: (): boolean => {
    return authUtil.hasRole('SELLER');
  },

  /**
   * Check if user is buyer
   */
  isBuyer: (): boolean => {
    return authUtil.hasRole('BUYER');
  },

  /**
   * Check if user is 3PL
   */
  is3PL: (): boolean => {
    return authUtil.hasRole('3PL');
  },
};
