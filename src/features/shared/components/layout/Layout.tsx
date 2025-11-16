import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import SellerHeader from './Header';

export default function SellerLayout() {
  // ✅ FIXED: Use hook directly instead of context
  const { data: onboarding, isLoading, error, fetchData } = useOnboarding();

  // ========== INITIAL DATA LOAD ==========
  useEffect(() => {
    console.log('🔄 [SellerLayout] Initial data load...');
    fetchData().then(() => {
      console.log('✅ [SellerLayout] Data loaded');
    }).catch((err) => {
      console.error('❌ [SellerLayout] Error:', err.message);
    });
  }, []);

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
  );
}
