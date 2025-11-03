import apiClient from "@/api/api.client";
import { BankDetails, bankDetailsSchema, OrgKycData } from "../schemas/onboarding.schema";
import { CatalogData, OnboardingResponse, SubmitOnboardingResponse } from "../types/onboarding.types";

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
      // ✅ Only log if it's a REAL error (not success)
      console.error("❌ Real API Error:", error.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update organization KYC";

      throw new Error(errorMessage);
    }
  }

  /**
   * API 2: Update Bank Details WITH FILE UPLOAD
   */

  async updateBankDetails(bankData: BankDetails, files: File[] = []): Promise<OnboardingResponse> {
  console.log("📤 updateBankDetails called with:", { bankData, files });
    try {
    // ✅ VALIDATION: Parse and validate data first
    const validatedData = bankDetailsSchema.parse(bankData);

    // ✅ BUILD FormData - do NOT set manual Content-Type header
    const formData = new FormData();

    // Add form fields
    formData.append("accountNumber", validatedData.accountNumber);
    formData.append("ifsc", validatedData.ifsc);
    formData.append("bankName", validatedData.bankName);
    formData.append("accountHolderName", validatedData.accountHolderName);
    formData.append("pennyDropStatus", validatedData.pennyDropStatus || "PENDING");
    formData.append("pennyDropScore", String(validatedData.pennyDropScore || 0));

    // ✅ CRITICAL: Include file type metadata
    files.forEach((file, index) => {
      formData.append(`bankDocs`, file);
      formData.append(`bankDocsType`, file.type); // Add file type for backend validation
    });

    // ✅ Don't set Content-Type manually - axios/fetch will handle it
    const response = await apiClient.put(`${this.baseUrl}/bank`, formData, {
      headers: {
        // REMOVED: "Content-Type": "multipart/form-data" - axios sets this automatically
      },
    });

    // ✅ VALIDATION: Check response structure before parsing
    if (!response.data) {
      throw new Error("Empty response from server");
    }

    // ✅ Response validation with fallback
    const responseData = response.data.primaryBankAccount || response.data;
    const validatedResponse = bankDetailsSchema.parse(responseData);

    return response.data;
  } catch (error: any) {
    // ✅ IMPROVED: Differentiate error types
    // if (error instanceof z.ZodError) {
    //   const fieldErrors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    //   throw new Error(`Validation error: ${fieldErrors}`);
    // }

    if (error.response) {
      // ✅ Backend error with details
      throw new Error(
        error.response.data?.message || 
        error.response.statusText || 
        "Server error"
      );
    }

    throw new Error(error.message || "Failed to update bank details");
  }
}


  async updateBankDetails1(
    bankData: BankDetails,
    filesArray: File[] = [],
    documentMetadata: Array<{ type: string; fileName: string }> = []
  ): Promise<OnboardingResponse> {
    try {
      const validatedData = bankDetailsSchema.parse(bankData);

      const formData = new FormData();

      // Add form fields
      formData.append("accountNumber", validatedData.accountNumber);
      formData.append("ifsc", validatedData.ifsc);
      formData.append("bankName", validatedData.bankName);
      formData.append("accountHolderName", validatedData.accountHolderName);
      formData.append("isPennyDropVerified", String(validatedData.isPennyDropVerified || false));

      if (validatedData.payoutMethod) {
        formData.append("payoutMethod", validatedData.payoutMethod);
      }
      if (validatedData.upiDetails) {
        formData.append("upiDetails", validatedData.upiDetails);
      }

      // Add all files under the same field name 'documents'
      filesArray.forEach((file) => {
        formData.append("documents", file);
      });

      // Send metadata as JSON string
      if (documentMetadata.length > 0) {
        formData.append("documentMetadata", JSON.stringify(documentMetadata));
      }

      console.log("📤 Sending to backend:", {
        accountNumber: validatedData.accountNumber,
        filesCount: filesArray.length,
        metadataCount: documentMetadata.length,
      });

      const response = await apiClient.put(`${this.baseUrl}/bank`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Response from backend:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Service error:", error);
      throw new Error(error.message || "Failed to update bank details");
    }
  }

  /**
   * API 3: Update Compliance Documents WITH FILE UPLOAD
   * PUT /organizations/my-organization/onboarding/docs
   * ✅ CRITICAL: Backend expects BOOLEAN values converted to strings
   */
  async updateComplianceDocs(
    declarations: {
      warrantyAssurance: boolean;
      termsAccepted: boolean;
      amlCompliance: boolean;
    },
    files: File[] = []
  ): Promise<OnboardingResponse> {
    try {
      const formData = new FormData();

      // ✅ Append declarations as STRING ("true" or "false")
      // Backend Nest.js DTO transformer will convert to boolean
      formData.append("warrantyAssurance", String(declarations.warrantyAssurance));
      formData.append("termsAccepted", String(declarations.termsAccepted));
      formData.append("amlCompliance", String(declarations.amlCompliance));

      // ✅ Append each file individually with field name 'complianceDocs'
      files.forEach((file) => {
        formData.append("complianceDocs", file);
      });

      console.log("📤 FormData being sent to API:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(` ${key}: [File] ${(value as File).name} (${(value as File).size} bytes)`);
        } else {
          console.log(` ${key}: ${value}`);
        }
      }

      // ✅ Send to API using apiClient
      const response = await apiClient.put(
        `${this.baseUrl}/docs`,
        formData
        // Note: Do NOT include Content-Type header - browser sets it automatically with boundary
      );

      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error Response:", error.response?.data);
      throw new Error(error.response?.data?.message || error.message || "Failed to update compliance documents");
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
