
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OnboardingDataContext } from '../context/onboarding.context';
import onboardingService from '../services/onboarding.service';
import { OnboardingResponse } from '../types/onboarding.types';
import SellerHeader from './SellerHeader';

export default function SellerLayout() {
  const [onboarding, setOnboarding] = useState<OnboardingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== FETCH DATA ON MOUNT (ONLY ONCE) ==========
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // console.log('🔄 [SellerLayout] Fetching onboarding data...');

        const data = await onboardingService.getOnboardingStatus();
        setOnboarding(data);
        console.log('✅ [SellerLayout] Onboarding data loaded:', data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('❌ [SellerLayout] Error loading data:', message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  // ========== MANUAL REFRESH ==========
  const refreshData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [SellerLayout] Refreshing onboarding data...');

      const data = await onboardingService.getOnboardingStatus();
      setOnboarding(data);
      console.log('✅ [SellerLayout] Data refreshed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('❌ [SellerLayout] Refresh error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== ERROR STATE ==========
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold text-red-800">Error Loading Data</h1>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading seller data...</p>
        </div>
      </div>
    );
  }

  // ========== MAIN LAYOUT ==========
  return (
    <OnboardingDataContext.Provider
      value={{
        onboarding,
        isLoading,
        error,
        refreshData,
      }}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <SellerHeader
          kycStatus={onboarding?.kycStatus}
          showKYCBadge={true}
        />

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </OnboardingDataContext.Provider>
  );
}
