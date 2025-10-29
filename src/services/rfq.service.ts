/**
 * RFQ Service
 * Handles RFQ-related API calls
 */

import { PaginationParams, RFQDetailResponse, RFQListResponse } from '@/shared/types/api.types';

export const rfqService = {
  /**
   * Get RFQ inbox/list
   */
  getRFQList: async (params?: PaginationParams): Promise<RFQListResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockRfqs = [
      {
        rfqId: 'RFQ-2481',
        rfqNumber: '#2481',
        buyer: {
          name: 'Shree Constructions Pvt Ltd',
          location: 'Bhubaneswar',
          rating: 4.2
        },
        product: {
          category: 'HR Coils',
          grade: 'IS2062 E250',
          quantity: 200,
          unit: 'MT' as const
        },
        incoterms: 'DAP',
        targetPin: '751001',
        needByDate: '2024-10-10',
        status: 'OPEN' as const,
        expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        suggestedMatch: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        rfqId: 'RFQ-2480',
        rfqNumber: '#2480',
        buyer: {
          name: 'Metro Infrastructure Ltd',
          location: 'Raipur',
          rating: 4.5
        },
        product: {
          category: 'TMT Bars',
          grade: 'Fe500D',
          quantity: 150,
          unit: 'MT' as const
        },
        incoterms: 'EXW',
        targetPin: '492001',
        needByDate: '2024-10-15',
        status: 'OPEN' as const,
        expiryAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        suggestedMatch: true,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ];

    return {
      rfqs: mockRfqs,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: mockRfqs.length,
        pages: 1
      }
    };
  },

  /**
   * Get RFQ details
   */
  getRFQDetail: async (rfqId: string): Promise<RFQDetailResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      rfq: {
        rfqId,
        rfqNumber: '#2481',
        buyer: {
          name: 'Shree Constructions Pvt Ltd',
          location: 'Bhubaneswar',
          gstin: '21AABCS1234H1ZP',
          rating: 4.2
        },
        product: {
          category: 'HR Coils',
          grade: 'IS2062 E250',
          size: '2mm x 1250mm',
          quantity: 200,
          unit: 'MT'
        },
        incoterms: 'DAP',
        targetPin: '751001',
        needByDate: '2024-10-10',
        status: 'OPEN',
        expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        delivery: {
          incoterms: 'DAP',
          targetPin: '751001',
          needByDate: '2024-10-10'
        },
        notes: 'Quality certification required. Prefer delivery in 2 batches.',
        timeline: [
          {
            event: 'RFQ Created',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            actor: 'Buyer'
          },
          {
            event: 'Pre-scored Sellers',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 60000).toISOString(),
            actor: 'System'
          }
        ]
      }
    };
  },
};
