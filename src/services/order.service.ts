/**
 * Order Service
 * Handles order-related API calls
 */

import { OrdersListResponse } from '@/shared/types/api.types';

export const orderService = {
  /**
   * Get seller's orders
   */
  getMyOrders: async (): Promise<OrdersListResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockOrders = [
      {
        orderId: 'ORD-1001',
        orderNumber: '#1001',
        rfqNumber: '#2481',
        buyer: {
          name: 'Shree Constructions Pvt Ltd',
          location: 'Bhubaneswar',
        },
        product: {
          name: 'HR Coils - IS2062 E250',
          quantity: 200,
          unit: 'MT',
        },
        pricing: {
          pricePerMT: 45000,
          freightPerMT: 2000,
          totalValue: 9400000,
        },
        status: 'IN_PROGRESS' as const,
        deliveryDate: '2024-10-10',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        orderId: 'ORD-1000',
        orderNumber: '#1000',
        rfqNumber: '#2475',
        buyer: {
          name: 'Metro Infrastructure Ltd',
          location: 'Raipur',
        },
        product: {
          name: 'TMT Bars - Fe500D',
          quantity: 150,
          unit: 'MT',
        },
        pricing: {
          pricePerMT: 48000,
          freightPerMT: 1800,
          totalValue: 7470000,
        },
        status: 'DELIVERED' as const,
        deliveryDate: '2024-10-05',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      orders: mockOrders,
    };
  },

  /**
   * Get order details
   */
  getOrderDetail: async (orderId: string) => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      order: {
        orderId,
        orderNumber: '#1001',
        rfqNumber: '#2481',
        buyer: {
          name: 'Shree Constructions Pvt Ltd',
          location: 'Bhubaneswar',
        },
        product: {
          name: 'HR Coils - IS2062 E250',
          quantity: 200,
          unit: 'MT',
        },
        pricing: {
          pricePerMT: 45000,
          freightPerMT: 2000,
          totalValue: 9400000,
        },
        status: 'IN_PROGRESS',
        deliveryDate: '2024-10-10',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  },
};
