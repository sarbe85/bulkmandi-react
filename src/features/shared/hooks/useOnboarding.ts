import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/shared/hooks/use-toast';
import { useCallback } from 'react';
import onboardingService from '../services/onboarding.service';
import { useOnboardingStore } from '../store/onboarding.store';
import { OnboardingResponse } from '../types/onboarding.types';

export function useOnboarding() {
  const store = useOnboardingStore();
  const { toast } = useToast();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const fetchData = useCallback(async () => {
    try {
      store.setLoading(true);
      const data = await onboardingService.getData();
      store.setData(data);
      return data;
    } catch (error: any) {
      const message = error.message;
      store.setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      store.setLoading(false);
    }
  }, [store, toast]);

  // ✅ ADDED: Upload document
  const uploadDocument = useCallback(
    async (file: File, docType: string) => {
      try {
        store.setSaving(true);
        const result = await onboardingService.uploadDocument(file, docType);
        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully`,
        });
        return result;
      } catch (error: any) {
        const message = error.message;
        store.setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw error;
      } finally {
        store.setSaving(false);
      }
    },
    [store, toast]
  );

  // ✅ ADDED: Delete document
  const deleteDocument = useCallback(
    async (docType: string) => {
      try {
        store.setSaving(true);
        await onboardingService.deleteDocument(docType);
        toast({
          title: 'Success',
          description: 'Document deleted successfully',
        });
      } catch (error: any) {
        const message = error.message;
        store.setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        throw error;
      } finally {
        store.setSaving(false);
      }
    },
    [store, toast]
  );

  const submitStep = useCallback(
    async (stepApi: string, data: any) => {
      try {
        store.setSaving(true);
        let response: OnboardingResponse;

        switch (stepApi) {
          case 'org-kyc':
            response = await onboardingService.updateOrgKyc(data);
            break;
          case 'bank-details':
            response = await onboardingService.updateBankDetails(data);
            break;
          case 'compliance-docs':
            response = await onboardingService.updateCompliance(data);
            break;
          case 'buyer-preferences':
            response = await onboardingService.updateBuyerPreferences(data);
            break;
          case 'catalog':
            response = await onboardingService.updateCatalog(data);
            break;
          default:
            throw new Error(`Unknown step: ${stepApi}`);
        }

        store.setData(response);
        store.setError(null);
        toast({ title: 'Success', description: 'Step saved successfully' });
        return response;
      } catch (error: any) {
        const message = error.message;
        store.setError(message);
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw error;
      } finally {
        store.setSaving(false);
      }
    },
    [store, toast]
  );

  const submit = useCallback(
    async (payload: any) => {
      try {
        store.setSaving(true);
        const response = await onboardingService.submit();
        store.setData(response);
        toast({
          title: 'Success',
          description: 'Onboarding submitted for verification',
        });
        return response;
      } catch (error: any) {
        const message = error.message;
        store.setError(message);
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw error;
      } finally {
        store.setSaving(false);
      }
    },
    [store, toast]
  );

  return {
    // Data
    data: store.data,
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    error: store.error,
    
    // Actions
    fetchData,
    uploadDocument, // ✅ ADDED
    deleteDocument, // ✅ ADDED
    submitStep,
    submit,
    reset: store.reset,
  };
}
