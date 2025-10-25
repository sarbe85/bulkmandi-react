import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import KYCStatus from "./pages/KYCStatus";
import NotFound from "./pages/NotFound";
import RFQList from "./pages/RFQList";
import RoleSelection from "./pages/RoleSelection";
import SellerDashboard from "./pages/SellerDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SellerOnboarding from "./pages/onboarding/SellerOnboarding";
import OrdersList from "./pages/orders/OrdersList";
import QuotesList from "./pages/quotes/QuotesList";
import RFQDetail from "./pages/rfq/RFQDetail";

function App() {
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/get-started" element={<RoleSelection />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Seller Onboarding - Protected but no OnboardingGuard */}
          <Route 
            path="/seller-onboarding" 
            element={
              <ProtectedRoute>
                <SellerOnboarding />
              </ProtectedRoute>
            } 
          />

          {/* KYC Status - Protected with OnboardingGuard and DashboardLayout */}
          <Route 
            path="/kyc-status" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <KYCStatus />
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          {/* Dashboard Routes - All at root level with full protection */}
          <Route 
            path="/dashboard" 
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
            path="/rfqs" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <RFQList />
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rfqs/:rfqId" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <RFQDetail />
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/quotes" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <QuotesList />
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <OrdersList />
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <DashboardLayout>
                    <div>Profile</div>
                  </DashboardLayout>
                </OnboardingGuard>
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;