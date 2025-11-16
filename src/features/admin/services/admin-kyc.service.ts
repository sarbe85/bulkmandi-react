import apiClient from "@/api/api.client";
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
  UnlockForUpdatePayload,
  UnlockForUpdateResponse,
  WatchlistPayload,
  WatchlistResponse,
} from "../types/admin-kyc.types";

/**
 * AdminKYCService
 * Handles all KYC-related operations for admin dashboard
 */
class AdminKYCService {
  private readonly baseUrl = "/admin/kyc";

  /**
   * API 10: Get Dashboard Stats
   * GET /admin/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  }

  /**
   * API 11: Get KYC Queue
   * GET /admin/kyc/queue?status=SUBMITTED&role=SELLER&search=...&page=1&limit=20
   */
  async getKYCQueue(filters: KYCQueueFilters = {}): Promise<KYCQueueResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.role) params.append("role", filters.role);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/queue?${queryString}` : `${this.baseUrl}/queue`;

    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * API 12: Get KYC Case Detail
   * GET /admin/kyc/case/:caseId
   */
  async getKYCCaseDetail(caseId: string): Promise<KYCCaseDetail> {
    const response = await apiClient.get(`${this.baseUrl}/case/${caseId}`);
    return response.data;
  }

  /**
   * API 13: Approve KYC Case
   * POST /admin/kyc/case/:caseId/approve
   */
  async approveKYC(caseId: string, payload: ApproveKYCPayload): Promise<ApproveKYCResponse> {
    const response = await apiClient.post(`${this.baseUrl}/case/${caseId}/approve`, payload);
    return response.data;
  }

  /**
   * API 14: Reject KYC Case
   * POST /admin/kyc/case/:caseId/reject
   */
  async rejectKYC(caseId: string, payload: RejectKYCPayload): Promise<RejectKYCResponse> {
    const response = await apiClient.post(`${this.baseUrl}/case/${caseId}/reject`, payload);
    return response.data;
  }

  /**
   * API 15: Request More Information
   * POST /admin/kyc/case/:caseId/request-info
   */
  async requestInfo(caseId: string, payload: RequestInfoPayload): Promise<RequestInfoResponse> {
    const response = await apiClient.post(`${this.baseUrl}/case/${caseId}/request-info`, payload);
    return response.data;
  }

  /**
   * API 16: Add to Watchlist
   * POST /admin/kyc/case/:caseId/watchlist
   */
  async addToWatchlist(caseId: string, payload: WatchlistPayload): Promise<WatchlistResponse> {
    const response = await apiClient.post(`${this.baseUrl}/case/${caseId}/watchlist`, payload);
    return response.data;
  }

  /**
   * API 17: Get KYC Case History
   * GET /admin/kyc/history/:orgId
   * Returns all submission attempts for an organization
   */
  async getKYCHistory(orgId: string): Promise<KYCHistoryItem[]> {
    const response = await apiClient.get(`${this.baseUrl}/history/${orgId}`);
    return response.data;
  }

  /**
   * API 18: Unlock for Update
   * POST /admin/kyc/case/:caseId/unlock-for-update
   * Allows approved KYC to be unlocked for seller to make updates
   */
  async unlockForUpdate(caseId: string, payload: UnlockForUpdatePayload = {}): Promise<UnlockForUpdateResponse> {
    const response = await apiClient.post(`${this.baseUrl}/case/${caseId}/unlock-for-update`, payload);
    return response.data;
  }
}

export default new AdminKYCService();
