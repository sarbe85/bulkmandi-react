// src/features/buyer/layout/BuyerLayout.tsx

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useOnboarding } from '@/features/shared/hooks/useOnboarding';
import BuyerHeader from '@/features/shared/components/layout/Header';

export default function BuyerLayout() {
  const { data: onboarding, isLoading, error, fetchData } = useOnboarding();

  // ========== INITIAL DATA LOAD ==========
  useEffect(() => {
    console.log('🔄 [BuyerLayout] Initial data load...');
    fetchData().then(() => {
      console.log('✅ [BuyerLayout] Data loaded');
    }).catch((err) => {
      console.error('❌ [BuyerLayout] Error:', err.message);
    });
  }, []);

  // ========== ERROR STATE ==========
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full border">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Error Loading Data</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // ========== LOADING STATE ==========
  if (isLoading && !onboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading buyer dashboard...</p>
        </div>
      </div>
    );
  }

  // ========== MAIN LAYOUT ==========
  return (
    <div className="min-h-screen bg-background">
      <BuyerHeader />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
