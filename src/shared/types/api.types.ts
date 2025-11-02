/**
 * Core API Types
 * Centralized type definitions for API requests and responses
 * These types can be shared with React Native
 */

export type UserRole = 'SELLER' | 'BUYER' | 'ADMIN' | '3PL';


export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  organizationId?: string;
  organizationName?: string;
  permissions?: string[]; // For ADMIN
  onboardingCompleted?: boolean;
  createdAt?: string;
}

// ✅ This matches your backend response exactly
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  mobile: string;
  role: UserRole;
  organizationName?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, unknown>;
}

// Dashboard Types
export interface DashboardKPIs {
  openRfqs: number;
  quotesPendingAction: number;
  ordersToDispatch: number;
}

export type TaskType = 'COMPLETE_KYC' | 'SET_CATALOG' | 'SUBMIT_QUOTE' | 'DISPATCH_ORDER';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  type: TaskType;
  completed: boolean;
  priority: TaskPriority;
  title?: string;
  description?: string;
}

export interface RecentRFQ {
  rfqId: string;
  product: string;
  quantity: string;
  incoterms: string;
  targetPin: string;
  status: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  tasks: Task[];
  recentRfqs: RecentRFQ[];
}

// RFQ Types
export type RFQStatus = 'OPEN' | 'CLOSED' | 'AWARDED' | 'EXPIRED';

export interface RFQProduct {
  category: string;
  grade: string;
  size?: string;
  quantity: number;
  unit: string;
}

export interface RFQBuyer {
  name: string;
  location: string;
  gstin?: string;
  rating?: number;
}

export interface RFQDelivery {
  incoterms: string;
  targetPin: string;
  needByDate: string;
}

export interface RFQ {
  rfqId: string;
  rfqNumber: string;
  buyer: RFQBuyer;
  product: RFQProduct;
  incoterms: string;
  targetPin: string;
  needByDate: string;
  status: RFQStatus;
  expiryAt?: string;
  suggestedMatch?: boolean;
  createdAt: string;
  delivery?: RFQDelivery;
  notes?: string;
}

export interface RFQListResponse {
  rfqs: RFQ[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RFQDetailResponse {
  rfq: RFQ & {
    timeline?: Array<{
      event: string;
      timestamp: string;
      actor: string;
    }>;
  };
}

// Quote Types
export type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface CreateQuoteRequest {
  rfqId: string;
  pricePerMT: number;
  freightPerMT: number;
  leadDays: number;
  validityHours: number;
  notes?: string;
}

export interface Quote {
  quoteId: string;
  rfqId: string;
  rfqNumber?: string;
  buyer?: string;
  product?: string;
  quantity?: number;
  pricePerMT: number;
  freightPerMT: number;
  totalPrice: number;
  totalValue?: number;
  leadDays: number;
  validityHours: number;
  expiryAt: string;
  status: QuoteStatus;
  floorApplied?: boolean;
  notes?: string;
  submittedAt?: string;
}

export interface QuoteResponse {
  quote: Quote;
}

export interface QuotesListResponse {
  quotes: Quote[];
}

// Order Types
export type OrderStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  orderId: string;
  orderNumber: string;
  rfqNumber: string;
  buyer: {
    name: string;
    location: string;
  };
  product: {
    name: string;
    quantity: number;
    unit: string;
  };
  pricing: {
    pricePerMT: number;
    freightPerMT: number;
    totalValue: number;
  };
  status: OrderStatus;
  deliveryDate: string;
  createdAt: string;
}

export interface OrdersListResponse {
  orders: Order[];
}

// API Error Response
export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, unknown>;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}
