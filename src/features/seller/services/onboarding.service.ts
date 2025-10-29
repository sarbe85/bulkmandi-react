/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_CONFIG, STORAGE_KEYS } from "@/config/api.config";
import {
  BankDocData,
  CatalogData,
  ComplianceDocsData,
  OnboardingResponse,
  OnboardingReviewResponse,
  OrgKYCData,
} from "../types/onboarding.types";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// Make API requests with proper headers and error handling
const apiRequest = async (
  method: string,
  endpoint: string,
  body?: any
): Promise<any> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please login again.");
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const options: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.HEADERS,
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      throw error;
    }
    throw new Error("Network error. Please try again.");
  }
};

// Export service object with all methods
export const onboardingService = {
  // Get current onboarding status
  async getOnboardingStatus(): Promise<OnboardingResponse> {
    try {
      const response = await apiRequest(
        "GET",
        "/organizations/my-organization/onboarding"
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch onboarding status:", error);
      throw error;
    }
  },

  // Update Organization KYC
  async updateOrgKYC(data: OrgKYCData): Promise<OnboardingResponse> {
    try {
      const payload = {
        legalName: data.legalName,
        tradeName: data.tradeName,
        gstin: data.gstin,
        pan: data.pan,
        cin: data.cin,
        registeredAddress: data.registeredAddress,
        businessType: data.businessType,
        incorporationDate: data.incorporationDate,
        plantLocations: data.plantLocations?.map((plant) => ({
          street: plant.street || plant.name || `${plant.city} Plant`,
          city: plant.city,
          state: plant.state || "",
          pin: plant.pincode || plant.pin || "",
        })),
        primaryContact: {
          name: data.primaryContact.name,
          email: data.primaryContact.email,
          mobile: data.primaryContact.mobile,
          role: data.primaryContact.role || "CEO",
        },
      };

      const response = await apiRequest(
        "PUT",
        "/organizations/my-organization/onboarding/kyc",
        payload
      );
      return response;
    } catch (error) {
      console.error("Failed to update organization KYC:", error);
      throw error;
    }
  },

  // Update Bank Details
  async updateBankDetails(data: BankDocData): Promise<OnboardingResponse> {
    try {
      const payload = {
        accountNumber: data.accountNumber,
        ifsc: data.ifscCode,
        bankName: data.bankName || "Bank",
        accountHolderName: data.accountName,
        accountType: data.accountType || "Current",
        pennyDropStatus: data.isPennyDropVerified ? "VERIFIED" : "PENDING",
        pennyDropScore: data.isPennyDropVerified ? 100 : 0,
        documents: (data.documents || []).map((doc) => ({
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
        })),
      };

      const response = await apiRequest(
        "PUT",
        "/organizations/my-organization/onboarding/bank",
        payload
      );
      return response;
    } catch (error) {
      console.error("Failed to update bank details:", error);
      throw error;
    }
  },

  // Upload Compliance Documents
  async uploadComplianceDocs(
    data: ComplianceDocsData
  ): Promise<OnboardingResponse> {
    try {
      const payload = {
        complianceDocuments: data.complianceDocuments.map((doc) => ({
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
        })),
      };

      const response = await apiRequest(
        "PUT",
        "/organizations/my-organization/onboarding/docs",
        payload
      );
      return response;
    } catch (error) {
      console.error("Failed to upload compliance documents:", error);
      throw error;
    }
  },

  // Update Product Catalog
  async updateCatalog(data: CatalogData): Promise<OnboardingResponse> {
    try {
      const response = await apiRequest(
        "PUT",
        "/organizations/my-organization/onboarding/catalog",
        data
      );
      return response;
    } catch (error) {
      console.error("Failed to update catalog:", error);
      throw error;
    }
  },

  // Get Onboarding Review Data
  async getOnboardingReview(): Promise<OnboardingReviewResponse> {
    try {
      const response = await apiRequest(
        "GET",
        "/organizations/my-organization/onboarding"
      );
      return response;
    } catch (error) {
      console.error("Failed to get onboarding review:", error);
      throw error;
    }
  },

  // Submit Onboarding for Review
  async submitOnboarding(): Promise<any> {
    try {
      const response = await apiRequest(
        "POST",
        "/organizations/my-organization/onboarding/submit"
      );
      return {
        success: true,
        message: "Onboarding submitted successfully for review",
        data: response,
      };
    } catch (error) {
      console.error("Failed to submit onboarding:", error);
      throw error;
    }
  },

  // Get KYC Status
  async getKYCStatus(): Promise<any> {
    try {
      const response = await apiRequest(
        "GET",
        "/organizations/my-organization/onboarding"
      );
      return {
        overallStatus: response.kycStatus?.toLowerCase() || "draft",
        completionPercentage: Math.round(
          (response.completedSteps?.length / 4) * 100
        ),
        checks: {
          gstin: response.orgKyc?.gstin ? "validated" : "pending",
          pan: response.orgKyc?.pan ? "validated" : "pending",
          bank: response.primaryBankAccount ? "validated" : "pending",
          watchlist: "pending",
          factoryLicense: "pending",
        },
        lastUpdated: response.updatedAt,
      };
    } catch (error) {
      console.error("Failed to fetch KYC status:", error);
      throw error;
    }
  },

  // Refresh KYC Status
  async refreshKYCStatus(): Promise<any> {
    return this.getKYCStatus();
  },

  // Check if all steps completed
  isOnboardingComplete(completedSteps: string[]): boolean {
    const requiredSteps = [
      "orgKyc",
      "bankDetails",
      "complianceDocs",
      "catalog",
    ];
    return requiredSteps.every((step) => completedSteps.includes(step));
  },

  // Get completion percentage
  getCompletionPercentage(completedSteps: string[]): number {
    const requiredSteps = [
      "orgKyc",
      "bankDetails",
      "complianceDocs",
      "catalog",
    ];
    const completed = completedSteps.filter((step) =>
      requiredSteps.includes(step)
    ).length;
    return Math.round((completed / requiredSteps.length) * 100);
  },
  /**
   * Verify Penny Drop - Check if account number and IFSC match
   */
  async verifyPennyDrop(
    accountNumber: string,
    ifsc: string
  ): Promise<{ verified: boolean; accountName: string }> {
    try {
      const response = await apiRequest(
        "POST",
        "/seller/onboarding/penny-drop",
        {
          accountNumber,
          ifsc,
        }
      );
      return response;
    } catch (error: any) {
      console.error("Failed to verify penny drop:", error);
      throw new Error(
        error.message || "Account verification failed. Please check details."
      );
    }
  },
  /**
   * Fetch GSTIN details
   */
  async fetchGSTIN(gstin: string): Promise<any> {
    try {
      const response = await apiRequest(
        "GET",
        `/seller/onboarding/gstin-fetch?gstin=${gstin}`
      );
      return response;
    } catch (error: any) {
      console.error("Failed to fetch GSTIN details:", error);
      throw new Error(
        error.message || "Failed to fetch GSTIN details. Please enter manually."
      );
    }
  },
};

export default onboardingService;
