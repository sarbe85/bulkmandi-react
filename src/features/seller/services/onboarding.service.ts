import apiClient from "@/api/api.client";
import { BankDetails, bankDetailsSchema, OrgKycData } from "../schemas/onboarding.schema";
import { CatalogData, OnboardingResponse, SubmitOnboardingResponse } from "../types/onboarding.types";

interface FileWithDocType {
  file: File;
  docType: string;
}

class OnboardingService {
  private baseUrl = "/organizations/my-organization/onboarding";

  /**
   * API: Get Onboarding Status
   */
  async getOnboardingStatus(): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get("/organizations/my-organization/onboarding");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get onboarding status");
    }
  }

  /**
   * API 1: Update Organization KYC
   */
  async updateOrgKYC(data: OrgKycData): Promise<OnboardingResponse> {
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
          state: plant.state,
          pin: plant.pincode || plant.pin,
          country: plant.country || "India",
        })),
        primaryContact: {
          name: data.primaryContact.name,
          email: data.primaryContact.email,
          mobile: data.primaryContact.mobile,
          role: data.primaryContact.role || "CEO",
        },
      };

      console.log("📤 Sending payload to backend:", payload);
      const response = await apiClient.put(`${this.baseUrl}/kyc`, payload);
      return response.data;
    } catch (error: any) {
      console.error("❌ Real API Error:", error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update organization KYC";
      throw new Error(errorMessage);
    }
  }

   async uploadSingleDocument(file: File, docType: string): Promise<{ fileName: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);
    const response = await apiClient.post(`${this.baseUrl}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // expected { fileName, fileUrl }
  }

  // General delete function
  async deleteDocument(docType: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/documents/${docType}`);
    return response.data; // expected { message }
  }

  /**
   * ✅ MODIFIED: Update Bank Details Only (No files - files uploaded separately)
   */
  async updateBankDetailsOnly(bankData: BankDetails): Promise<OnboardingResponse> {
    console.log("📤 updateBankDetailsOnly called with:", bankData);
    try {
      // ✅ VALIDATION: Parse and validate data first
      const validatedData = bankDetailsSchema.parse(bankData);

      const payload = {
        accountNumber: validatedData.accountNumber,
        ifsc: validatedData.ifsc,
        bankName: validatedData.bankName,
        accountHolderName: validatedData.accountHolderName,
        pennyDropStatus: validatedData.pennyDropStatus || "PENDING",
        pennyDropScore: validatedData.pennyDropScore || 0,
      };

      console.log("📤 Sending bank details to backend...");
      const response = await apiClient.put(`${this.baseUrl}/bank-details`, payload);
      console.log("✅ Bank details updated successfully", response.data);

      // ✅ VALIDATION: Check response structure before parsing
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ updateBankDetailsOnly error:", error);
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.statusText || "Server error");
      }
      throw new Error(error.message || "Failed to update bank details");
    }
  }

   
async updateComplianceDeclarations(declarations: {
  warrantyAssurance: boolean;
  termsAccepted: boolean;
  amlCompliance: boolean;
}): Promise<OnboardingResponse> {
  try {
    const response = await apiClient.put(`${this.baseUrl}/compliance-declarations`, declarations);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update compliance declarations');
  }
}

  /**
   * API 4: Update Catalog & Pricing
   */
  async updateCatalog(data: CatalogData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/catalog`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update catalog");
    }
  }

  /**
   * API 5: Submit for Admin Review
   */
  async submitOnboarding(): Promise<SubmitOnboardingResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/submit`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to submit onboarding");
    }
  }

  /**
   * Helper: Penny Drop Verification
   */
  async verifyPennyDrop(accountNumber: string, ifsc: string): Promise<{ verified: boolean; accountName: string }> {
    try {
      const response = await apiClient.post<{
        verified: boolean;
        accountName: string;
      }>("/organizations/verify-penny-drop", {
        accountNumber,
        ifsc,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Account verification failed. Please check details.");
    }
  }

  /**
   * Helper: Upload Document (S3 pre-signed URL flow)
   */
  async uploadDocument(file: File, documentType: string): Promise<{ fileUrl: string }> {
    try {
      const { data: uploadData } = await apiClient.post<{
        uploadUrl: string;
        fileUrl: string;
      }>("/organizations/get-upload-url", {
        fileName: file.name,
        fileType: file.type,
        documentType,
      });

      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      return { fileUrl: uploadData.fileUrl };
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload document");
    }
  }

  /**
   * Helper: Fetch GSTIN details
   */
  async fetchGSTIN(gstin: string): Promise<any> {
    try {
      const response = await apiClient.get(`/organizations/gstin-fetch?gstin=${gstin}`);
      return response.data;
    } catch (error: any) {
      throw new Error("Failed to fetch GSTIN details. Please enter manually.");
    }
  }

  /**
   * API 7: Download Document (Secure)
   */
  async downloadDocument(fileName: string): Promise<void> {
    try {
      const response = await apiClient.get(`/organizations/my-organization/documents/${fileName}`, {
        responseType: "blob",
      });

      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      throw new Error(error.message || "Failed to download document");
    }
  }

  /**
   * API 8: Preview Document (Inline)
   */
  async previewDocument(fileName: string): Promise<string> {
    try {
      const response = await apiClient.get(`/organizations/my-organization/documents-preview/${fileName}`, {
        responseType: "blob",
      });

      const blob = response.data as Blob;
      return window.URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error(error.message || "Failed to preview document");
    }
  }
}

export default new OnboardingService();
