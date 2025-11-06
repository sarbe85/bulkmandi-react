import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OnboardingDataContext } from '../context/onboarding.context';
import onboardingService from '../services/onboarding.service';
import { OnboardingResponse } from '../types/onboarding.types';
import SellerHeader from './SellerHeader';

export default function SellerLayout() {
  const [onboarding, setOnboarding] = useState<OnboardingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRefreshing = useRef(false);

  // ========== INITIAL DATA LOAD ==========
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 [SellerLayout] Initial data load...');

        const data = await onboardingService.getOnboardingStatus();
        setOnboarding(data);
        console.log('✅ [SellerLayout] Data loaded');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('❌ [SellerLayout] Error:', message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  // ========== SILENT REFRESH (doesn't trigger loading state or affect navigation) ==========
  const silentRefresh = async () => {
    // Prevent concurrent refreshes
    if (isRefreshing.current) {
      console.log('⏭️ [SellerLayout] Refresh already in progress, skipping...');
      return;
    }

    try {
      isRefreshing.current = true;
      console.log('🔄 [SellerLayout] Silent refresh started...');

      const data = await onboardingService.getOnboardingStatus();
      
      // Update data WITHOUT triggering loading state
      setOnboarding(data);
      console.log('✅ [SellerLayout] Silent refresh complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [SellerLayout] Refresh error:', message);
      // Don't set error state to avoid disrupting user flow
    } finally {
      isRefreshing.current = false;
    }
  };

  // ========== ERROR STATE ==========
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full border">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <h1 className="text-xl font-bold text-destructive">Error Loading Data</h1>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-2 px-4 rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-semibold">Loading seller data...</p>
        </div>
      </div>
    );
  }

  // ========== MAIN LAYOUT ==========
  return (
    <OnboardingDataContext.Provider
      value={{
        onboarding,
        isLoading: false, // Never show loading during silent refresh
        error,
        silentRefresh,
      }}
    >
      <div className="min-h-screen bg-background">
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
