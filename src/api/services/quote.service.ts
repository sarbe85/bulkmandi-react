/**
 * Quote Service
 * Handles quote-related API calls
 */

import {
  CreateQuoteRequest,
  QuoteResponse,
  QuotesListResponse
} from '@/shared/types/api.types';

export const quoteService = {
  /**
   * Create a new quote
   */
  createQuote: async (data: CreateQuoteRequest): Promise<QuoteResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const totalPrice = (data.pricePerMT + data.freightPerMT) * 200; // Assuming 200 MT
    
    return {
      quote: {
        quoteId: 'QUOTE-' + Date.now(),
        rfqId: data.rfqId,
        rfqNumber: '#2481',
        buyer: 'Shree Constructions Pvt Ltd',
        product: 'HR Coils IS2062 E250',
        quantity: 200,
        pricePerMT: data.pricePerMT,
        freightPerMT: data.freightPerMT,
        totalPrice,
        totalValue: totalPrice,
        leadDays: data.leadDays,
        validityHours: data.validityHours,
        expiryAt: new Date(Date.now() + data.validityHours * 60 * 60 * 1000).toISOString(),
        status: 'SUBMITTED',
        floorApplied: false,
        notes: data.notes,
        submittedAt: new Date().toISOString()
      }
    };
  },

  /**
   * Get my quotes
   */
  getMyQuotes: async (): Promise<QuotesListResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      quotes: [
        {
          quoteId: 'QUOTE-001',
          rfqId: 'RFQ-2481',
          rfqNumber: '#2481',
          buyer: 'Shree Constructions Pvt Ltd',
          product: 'HR Coils IS2062 E250',
          quantity: 200,
          pricePerMT: 45400,
          freightPerMT: 1250,
          totalPrice: 9330000,
          totalValue: 9330000,
          leadDays: 5,
          validityHours: 24,
          expiryAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          status: 'SUBMITTED',
          floorApplied: false,
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  },
};
