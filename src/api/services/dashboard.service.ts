/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */

import { DashboardData } from '@/shared/types/api.types';

export const dashboardService = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<DashboardData> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      kpis: {
        openRfqs: 12,
        quotesPendingAction: 3,
        ordersToDispatch: 2
      },
      tasks: [
        {
          type: 'COMPLETE_KYC',
          completed: false,
          priority: 'HIGH',
          title: 'Complete KYC Verification',
          description: 'Submit required documents for verification'
        },
        {
          type: 'SET_CATALOG',
          completed: false,
          priority: 'MEDIUM',
          title: 'Set Up Product Catalog',
          description: 'Add your product categories and pricing'
        },
        {
          type: 'SUBMIT_QUOTE',
          completed: false,
          priority: 'HIGH',
          title: 'Submit Pending Quotes',
          description: '3 quotes require your attention'
        }
      ],
      recentRfqs: [
        {
          rfqId: 'RFQ-2481',
          product: 'HR Coils IS2062 E250',
          quantity: '200 MT',
          incoterms: 'DAP',
          targetPin: '751001',
          status: 'OPEN'
        },
        {
          rfqId: 'RFQ-2480',
          product: 'TMT Bars Fe500D',
          quantity: '150 MT',
          incoterms: 'EXW',
          targetPin: '492001',
          status: 'OPEN'
        },
        {
          rfqId: 'RFQ-2479',
          product: 'CR Coils',
          quantity: '100 MT',
          incoterms: 'DAP',
          targetPin: '500001',
          status: 'QUOTED'
        }
      ]
    };
  },
};
