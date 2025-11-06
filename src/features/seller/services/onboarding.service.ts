import apiClient from '@/api/api.client';
import { BankDetails, OrgKycData } from '../schemas/onboarding.schema';
import { CatalogData, DocumentUpload, OnboardingResponse, SubmitOnboardingResponse } from '../types/onboarding.types';

// ✅ File upload response interface - returned from Phase 1
interface FileUploadResponse {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
}

class OnboardingService {
  private baseUrl = '/organizations/my-organization/onboarding';

  /**
   * API: Get Onboarding Status
   */
  async getOnboardingStatus(): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get onboarding status');
    }
  }

  /**
   * API: Update Organization KYC
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
          country: plant.country || 'India',
        })),
        primaryContact: {
          name: data.primaryContact.name,
          email: data.primaryContact.email,
          mobile: data.primaryContact.mobile,
          role: data.primaryContact.role || 'CEO',
        },
      };

      const response = await apiClient.put(`${this.baseUrl}/kyc`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update organization KYC');
    }
  }

  // ===========================
  // PHASE 1: FILE UPLOAD (No DB)
  // ===========================

  /**
   * ✅ PHASE 1: Upload Single Document (Storage Only - No DB Update)
   * Returns file metadata for frontend to cache in state
   */
  async uploadSingleDocument(
    file: File,
    docType: string
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);

      console.log(`📤 Phase 1: Upload file to storage (NO DB update) - ${docType}`);

      const response = await apiClient.post(
        `${this.baseUrl}/documents/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log(`✅ File uploaded: ${file.name}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  }

  /**
   * ✅ PHASE 1: Delete Document from Storage (No DB Update)
   */
  async deleteDocument(docType: string): Promise<{ message: string }> {
    try {
      console.log(`🗑️ Phase 1: Delete from storage (NO DB update) - ${docType}`);

      const response = await apiClient.delete(
        `${this.baseUrl}/documents/${docType}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  }

  // ===========================
  // PHASE 2: PERSIST TO DB
  // ===========================

  /**
   * ✅ PHASE 2: Update Bank Details + Documents (Persists to DB)
   * Called on form submit with file URLs from frontend state
   */
  async updateBankDetailsWithDocuments(
    bankData: BankDetails,
    documents: FileUploadResponse[]
  ): Promise<OnboardingResponse> {
    try {
      console.log(`💾 Phase 2: Persist bank details + documents to DB`);
      console.log(`  Documents: ${documents.length}`);

      const payload = {
        accountNumber: bankData.accountNumber,
        ifsc: bankData.ifsc,
        bankName: bankData.bankName,
        accountHolderName: bankData.accountHolderName,
        pennyDropStatus: bankData.pennyDropStatus || 'PENDING',
        pennyDropScore: bankData.pennyDropScore || 0,
        documents, // ✅ Pass file URLs from frontend
      };

      const response = await apiClient.put(
        `${this.baseUrl}/bank-details`,
        payload
      );

      console.log(`✅ Bank details + documents persisted`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Persist error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save bank details');
    }
  }

  /**
   * ✅ PHASE 2: Update Compliance Documents + Declarations (Persists to DB)
   * Called on form submit with file URLs and declarations from frontend state
   */
  async updateComplianceDocsWithDeclarations(
    declarations: {
      warrantyAssurance?: boolean;
      termsAccepted?: boolean;
      amlCompliance?: boolean;
    },
    documents: DocumentUpload[]
  ): Promise<OnboardingResponse> {
    try {
      console.log(`💾 Phase 2: Persist compliance docs + declarations to DB`);
      console.log(`  Documents: ${documents.length}`);

      const payload = {
        warrantyAssurance: declarations.warrantyAssurance,
        termsAccepted: declarations.termsAccepted,
        amlCompliance: declarations.amlCompliance,
        documents, // ✅ Pass file URLs from frontend
      };

      const response = await apiClient.put(
        `${this.baseUrl}/compliance`,
        payload
      );

      console.log(`✅ Compliance docs + declarations persisted`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Persist error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save compliance documents');
    }
  }

  /**
   * API: Update Catalog & Pricing
   */
  async updateCatalog(data: CatalogData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/catalog`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update catalog');
    }
  }

  /**
   * API: Submit Onboarding for Admin Review
   */
  async submitOnboarding(): Promise<SubmitOnboardingResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/submit`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit onboarding');
    }
  }

  /**
   * Helper: Penny Drop Verification
   */
  async verifyPennyDrop(
    accountNumber: string,
    ifsc: string
  ): Promise<{ verified: boolean; accountName: string }> {
    try {
      const response = await apiClient.post('/organizations/verify-penny-drop', {
        accountNumber,
        ifsc,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Account verification failed');
    }
  }

  /**
   * Helper: GSTIN Fetch
   */
  async fetchGSTIN(gstin: string): Promise<any> {
    try {
      const response = await apiClient.get(`/organizations/gstin-fetch?gstin=${gstin}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch GSTIN details. Please enter manually.');
    }
  }

  /**
   * API: Download Document
   */
  async downloadDocument(fileName: string): Promise<void> {
    try {
      const response = await apiClient.get(
        `/organizations/my-organization/documents/${fileName}`,
        { responseType: 'blob' }
      );

      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download document');
    }
  }

  /**
   * API: Preview Document
   */
  async previewDocument(fileName: string): Promise<string> {
    try {
      const response = await apiClient.get(
        `/organizations/my-organization/documents-preview/${fileName}`,
        { responseType: 'blob' }
      );

      const blob = response.data as Blob;
      return window.URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to preview document');
    }
  }
}

export default new OnboardingService();