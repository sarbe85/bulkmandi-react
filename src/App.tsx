import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OnboardingGuard } from './components/OnboardingGuard';
import { AdminRoute } from './components/auth/AdminRoute';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerKYCStatus from './pages/seller/KYCStatus';
import SellerOnboarding from './pages/seller/Onboarding';
import SellerOrdersList from './pages/seller/OrdersList';
import SellerQuotesList from './pages/seller/QuotesList';
import SellerRFQDetail from './pages/seller/RFQDetail';
import SellerRFQList from './pages/seller/RFQList';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ============ PUBLIC ROUTES ============ */}
          <Route path="/" element={<Index />} />
          <Route path="/get-started" element={<RoleSelection />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* ============ SELLER ROUTES (PHASE 1) ============ */}
          <Route path="/seller">
            {/* Onboarding - No guard, but requires auth */}
            <Route
              path="onboarding"
              element={
                <ProtectedRoute>
                  <SellerOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Dashboard and main pages - require completed onboarding */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerDashboard />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="kyc-status"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerKYCStatus />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="rfqs"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerRFQList />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="rfqs/:rfqId"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerRFQDetail />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerOrdersList />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="quotes"
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <SellerQuotesList />
                    </DashboardLayout>
                  </OnboardingGuard>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ============ ADMIN ROUTES (PHASE 2) ============ */}
          <Route path="/admin">
            <Route
              path="dashboard"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </AdminRoute>
              }
            />
            {/* Add more admin routes here as you build Phase 2 */}
          </Route>

          {/* ============ LEGACY REDIRECTS ============ */}
          <Route path="/dashboard" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="/seller-onboarding" element={<Navigate to="/seller/onboarding" replace />} />
          <Route path="/kyc-status" element={<Navigate to="/seller/kyc-status" replace />} />
          <Route path="/rfqs" element={<Navigate to="/seller/rfqs" replace />} />
          <Route path="/quotes" element={<Navigate to="/seller/quotes" replace />} />
          <Route path="/orders" element={<Navigate to="/seller/orders" replace />} />

          {/* ============ 404 ============ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
