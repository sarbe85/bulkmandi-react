/**
 * API Configuration
 * Centralized API configuration for different environments
 * This file can be easily reused in React Native with minimal changes
 */

export const API_CONFIG = {
  // Base URL - configured via environment variables
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds

  // API Endpoints
  ENDPOINTS: {
    // ========== Auth ==========
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',

    // ========== Onboarding ==========
    ONBOARDING_STATUS: '/seller/onboarding/status',
    ONBOARDING_ORG_KYC: '/seller/onboarding/org-kyc',
    ONBOARDING_BANK_DETAILS: '/seller/onboarding/bank-details',
    ONBOARDING_BANK_DOCS: '/seller/onboarding/bank-docs',
    ONBOARDING_COMPLIANCE_DOCS: '/seller/onboarding/compliance-docs',
    ONBOARDING_CATALOG: '/seller/onboarding/catalog',
    ONBOARDING_SUBMIT: '/seller/onboarding/submit',

    // ========== Dashboard ==========
    DASHBOARD: '/seller/dashboard',
    KYC_STATUS: '/seller/kyc-status',

    // ========== Organization (Admin) ==========
    ADMIN_PENDING_KYC: '/organizations/admin/kyc/pending',
    ADMIN_KYC_APPROVE: (orgId: string) => `/organizations/admin/kyc/${orgId}/approve`,
    ADMIN_KYC_REJECT: (orgId: string) => `/organizations/admin/kyc/${orgId}/reject`,

    // ========== RFQ ==========
    RFQ_INBOX: '/rfq/inbox',
    RFQ_DETAIL: (id: string) => `/rfq/${id}`,
    RFQ_CREATE: '/rfq',

    // ========== Quotes ==========
    CREATE_QUOTE: '/quotes',
    MY_QUOTES: '/quotes/my-quotes',
    QUOTE_DETAIL: (id: string) => `/quotes/${id}`,
    QUOTE_UPDATE: (id: string) => `/quotes/${id}`,

    // ========== Orders ==========
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string) => `/orders/${id}`,
    DISPATCH_PREP: (id: string) => `/orders/${id}/dispatch-prep`,

    // ========== Catalog ==========
    CATALOG: '/catalog',
    CATALOG_UPDATE: '/catalog',

    // ========== Upload ==========
    UPLOAD_FILE: '/upload',
    UPLOAD_DOCUMENT: '/upload/document',
  },

  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Storage keys for tokens and user data
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
} as const;

// Environment helper
export const ENV = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  apiUrl: import.meta.env.VITE_API_URL,
} as const;
