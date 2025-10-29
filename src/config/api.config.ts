/**
 * API Configuration
 * Centralized API configuration that can be easily adapted for different environments
 * This file can be reused in React Native with minimal changes
 */

export const API_CONFIG = {
  // Base URL - can be set via environment variables
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1",
  // Timeouts
  TIMEOUT: 30000, // 30 seconds

  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",

    // Onboarding - Seller
    ONBOARDING_STATUS: "/organizations/my-organization/onboarding",
    ONBOARDING_KYC_UPDATE: "/organizations/my-organization/onboarding/kyc",
    ONBOARDING_BANK_UPDATE: "/organizations/my-organization/onboarding/bank",
    ONBOARDING_SUBMIT: "/organizations/my-organization/onboarding/submit",
    GSTIN_FETCH: "/seller/onboarding/gstin-fetch",
    PENNY_DROP: "/seller/onboarding/penny-drop",
    UPLOAD_DOCUMENT: "/seller/onboarding/upload-document",

    // Onboarding - Admin
    ADMIN_PENDING_KYC: "/organizations/admin/kyc/pending",
    ADMIN_KYC_APPROVE: (orgId: string) =>
      `/organizations/admin/kyc/${orgId}/approve`,
    ADMIN_KYC_REJECT: (orgId: string) =>
      `/organizations/admin/kyc/${orgId}/reject`,

    // Legacy endpoints (kept for compatibility)
    KYC_STATUS: "/seller/kyc-status",
    KYC_REFRESH: "/seller/kyc-status/refresh",

    // Dashboard
    DASHBOARD: "/seller/dashboard",

    // RFQ
    RFQ_INBOX: "/rfq/inbox",
    RFQ_DETAIL: (id: string) => `/rfq/${id}`,

    // Quotes
    CREATE_QUOTE: "/quotes",
    MY_QUOTES: "/quotes/my-quotes",
    QUOTE_DETAIL: (id: string) => `/quotes/${id}`,

    // Orders
    ORDERS: "/orders",
    ORDER_DETAIL: (id: string) => `/orders/${id}`,
    DISPATCH_PREP: (id: string) => `/orders/${id}/dispatch-prep`,

    // Catalog
    CATALOG: "/catalog",
  },

  // Headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// Storage keys for tokens and user data
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_data",
} as const;
