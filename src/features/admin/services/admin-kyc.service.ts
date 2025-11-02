/**
 * Admin KYC Service
 * Path: src/features/admin/services/admin-kyc.service.ts
 */

import apiClient from '@/api/api.client';
import {
  ApproveKYCPayload,
  ApproveKYCResponse,
  DashboardStats,
  KYCCaseDetail,
  KYCHistoryItem,
  KYCQueueFilters,
  KYCQueueResponse,
  RejectKYCPayload,
  RejectKYCResponse,
  RequestInfoPayload,
  RequestInfoResponse,
  WatchlistPayload,
  WatchlistResponse,
} from '../types/admin-kyc.types';

class AdminKYCService {
  /**
   * API 10: Get Dashboard Stats
   * GET /admin/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  }

  /**
   * API 11: Get KYC Queue
   * GET /admin/kyc/queue
   */
  async getKYCQueue(filters: KYCQueueFilters = {}): Promise<KYCQueueResponse> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<KYCQueueResponse>(
      `/admin/kyc/queue?${params.toString()}`
    );
    return response.data;
  }

  /**
   * API 12: Get KYC Case Detail
   * GET /admin/kyc/case/:caseId
   */
  async getKYCCaseDetail(caseId: string): Promise<KYCCaseDetail> {
    const response = await apiClient.get<KYCCaseDetail>(`/admin/kyc/case/${caseId}`);
    return response.data;
  }

  /**
   * API 13: Approve KYC Case
   * POST /admin/kyc/case/:caseId/approve
   */
  async approveKYC(caseId: string, payload: ApproveKYCPayload): Promise<ApproveKYCResponse> {
    const response = await apiClient.post<ApproveKYCResponse>(
      `/admin/kyc/case/${caseId}/approve`,
      payload
    );
    return response.data;
  }

  /**
   * API 14: Reject KYC Case
   * POST /admin/kyc/case/:caseId/reject
   */
  async rejectKYC(caseId: string, payload: RejectKYCPayload): Promise<RejectKYCResponse> {
    const response = await apiClient.post<RejectKYCResponse>(
      `/admin/kyc/case/${caseId}/reject`,
      payload
    );
    return response.data;
  }

  /**
   * API 15: Request More Information
   * POST /admin/kyc/case/:caseId/request-info
   */
  async requestInfo(caseId: string, payload: RequestInfoPayload): Promise<RequestInfoResponse> {
    const response = await apiClient.post<RequestInfoResponse>(
      `/admin/kyc/case/${caseId}/request-info`,
      payload
    );
    return response.data;
  }

  /**
   * API 16: Add to Watchlist
   * POST /admin/kyc/case/:caseId/watchlist
   */
  async addToWatchlist(caseId: string, payload: WatchlistPayload): Promise<WatchlistResponse> {
    const response = await apiClient.post<WatchlistResponse>(
      `/admin/kyc/case/${caseId}/watchlist`,
      payload
    );
    return response.data;
  }

  /**
   * API 17: Get KYC Case History
   * GET /admin/kyc/history/:orgId
   */
  async getKYCHistory(orgId: string): Promise<KYCHistoryItem[]> {
    const response = await apiClient.get<KYCHistoryItem[]>(`/admin/kyc/history/${orgId}`);
    return response.data;
  }
}

export default new AdminKYCService();
