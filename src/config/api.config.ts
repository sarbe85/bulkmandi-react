/**
 * API Configuration
 * Centralized API configuration that can be easily adapted for different environments
 * This file can be reused in React Native with minimal changes
 */

export const API_CONFIG = {
  // Base URL - can be set via environment variables
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    
    // Onboarding
    ONBOARDING_DRAFT: '/seller/onboarding/draft',
    ONBOARDING_SUBMIT: '/seller/onboarding/submit',
    GSTIN_FETCH: '/seller/onboarding/gstin-fetch',
    PENNY_DROP: '/seller/onboarding/penny-drop',
    UPLOAD_DOCUMENT: '/seller/onboarding/upload-document',
    KYC_STATUS: '/seller/kyc-status',
    KYC_REFRESH: '/seller/kyc-status/refresh',
    
    // Dashboard
    DASHBOARD: '/seller/dashboard',
    
    // RFQ
    RFQ_INBOX: '/rfq/inbox',
    RFQ_DETAIL: (id: string) => `/rfq/${id}`,
    
    // Quotes
    CREATE_QUOTE: '/quotes',
    MY_QUOTES: '/quotes/my-quotes',
    QUOTE_DETAIL: (id: string) => `/quotes/${id}`,
    
    // Orders
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string) => `/orders/${id}`,
    DISPATCH_PREP: (id: string) => `/orders/${id}/dispatch-prep`,
    
    // Catalog
    CATALOG: '/catalog',
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Storage keys for tokens
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
} as const;
