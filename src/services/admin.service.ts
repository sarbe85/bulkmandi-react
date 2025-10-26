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
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get pending count from queue
    const pendingQueue = JSON.parse(localStorage.getItem('kyc_pending_queue') || '[]');
    
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
        kycPending: pendingQueue.length,
        catalogPending: 8,
      },
    };
  },

  /**
   * Get Pending KYC Submissions
   * GET /organizations/admin/kyc/pending
   */
  getPendingKYC: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pendingQueue = JSON.parse(localStorage.getItem('kyc_pending_queue') || '[]');
    
    // Get full organization details for each pending item
    const pendingOrgs = pendingQueue.map((item: any) => {
      const orgData = localStorage.getItem(`organization_${item._id}`);
      return orgData ? JSON.parse(orgData) : null;
    }).filter(Boolean);
    
    return pendingOrgs;
  },

  /**
   * Get KYC Details for Review
   * GET /organizations/admin/kyc/:orgId
   */
  getKYCDetails: async (orgId: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orgData = localStorage.getItem(`organization_${orgId}`);
    
    if (!orgData) {
      throw new Error('Organization not found');
    }
    
    return JSON.parse(orgData);
  },

  /**
   * Approve KYC
   * POST /organizations/admin/kyc/:orgId/approve
   */
  approveKYC: async (orgId: string, remarks: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const orgData = localStorage.getItem(`organization_${orgId}`);
    
    if (!orgData) {
      throw new Error('Organization not found');
    }
    
    const org = JSON.parse(orgData);
    
    // Get admin user
    const userData = localStorage.getItem('user_data');
    const adminUser = userData ? JSON.parse(userData) : {};
    
    // Update organization
    org.kycStatus = 'APPROVED';
    org.kycApprovedAt = new Date().toISOString();
    org.kycApprovedBy = adminUser.id || 'ADMIN_USER';
    org.isVerified = true;
    org.approvalRemarks = remarks;
    org.updatedAt = new Date().toISOString();
    
    localStorage.setItem(`organization_${orgId}`, JSON.stringify(org));
    
    // Remove from pending queue
    const pendingQueue = JSON.parse(localStorage.getItem('kyc_pending_queue') || '[]');
    const updatedQueue = pendingQueue.filter((item: any) => item._id !== orgId);
    localStorage.setItem('kyc_pending_queue', JSON.stringify(updatedQueue));
    
    return org;
  },

  /**
   * Reject KYC
   * POST /organizations/admin/kyc/:orgId/reject
   */
  rejectKYC: async (orgId: string, remarks: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const orgData = localStorage.getItem(`organization_${orgId}`);
    
    if (!orgData) {
      throw new Error('Organization not found');
    }
    
    const org = JSON.parse(orgData);
    
    // Update organization
    org.kycStatus = 'REJECTED';
    org.rejectionRemarks = remarks;
    org.updatedAt = new Date().toISOString();
    
    localStorage.setItem(`organization_${orgId}`, JSON.stringify(org));
    
    // Remove from pending queue
    const pendingQueue = JSON.parse(localStorage.getItem('kyc_pending_queue') || '[]');
    const updatedQueue = pendingQueue.filter((item: any) => item._id !== orgId);
    localStorage.setItem('kyc_pending_queue', JSON.stringify(updatedQueue));
    
    return org;
  },
};
