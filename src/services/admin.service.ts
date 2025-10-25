/**
 * Admin Service
 * Handles admin-related API calls
 */

import { apiClient } from './api.client';
import { API_CONFIG } from '@/config/api.config';

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalOrders: number;
    totalRfqs: number;
    platformRevenue: number;
  };
  userStats: {
    sellers: number;
    buyers: number;
    admins: number;
    threepl: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'USER_REGISTERED' | 'ORDER_PLACED' | 'RFQ_CREATED' | 'KYC_APPROVED';
    user: string;
    timestamp: string;
    details: string;
  }>;
  pendingApprovals: {
    kycPending: number;
    catalogPending: number;
  };
}

export const adminService = {
  /**
   * Get admin dashboard data
   */
  getDashboard: async (): Promise<AdminDashboardData> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      kpis: {
        totalUsers: 248,
        totalOrders: 1456,
        totalRfqs: 3892,
        platformRevenue: 45678900,
      },
      userStats: {
        sellers: 142,
        buyers: 98,
        admins: 5,
        threepl: 3,
      },
      recentActivity: [
        {
          id: '1',
          type: 'USER_REGISTERED',
          user: 'Steel Manufacturing Ltd',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: 'New seller registered',
        },
        {
          id: '2',
          type: 'ORDER_PLACED',
          user: 'Shree Constructions',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          details: 'Order #1001 placed - ₹94L',
        },
        {
          id: '3',
          type: 'KYC_APPROVED',
          user: 'Metro Infrastructure Ltd',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          details: 'KYC verification approved',
        },
        {
          id: '4',
          type: 'RFQ_CREATED',
          user: 'BuildRight Corp',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: 'RFQ #2481 created - HR Coils',
        },
      ],
      pendingApprovals: {
        kycPending: 12,
        catalogPending: 8,
      },
    };
  },
};
