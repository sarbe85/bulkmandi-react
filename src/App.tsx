// import { sellerRoutes } from '@/features/seller/routes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Public pages
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import Dashboard from '@/features/common/pages/Dashboard';
import GetStarted from '@/features/common/pages/GetStarted';
import NotFound from '@/features/common/pages/NotFound';
import RoleSelection from '@/features/common/pages/RoleSelection';
import Index from '@/index';
import BuyerDashboard from './features/buyer/pages/BuyerDashboard';
import SellerDashboard from './features/seller/pages/SellerDashboard';
import OnboardingPage from './features/shared/pages/Onboarding';
// import { buyerRoutes } from './features/buyer/routes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC ROUTES */}
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/seller/onboarding" element={<OnboardingPage />} />
        <Route path="/buyer/onboarding" element={<OnboardingPage />} />

        {/* ✅ SELLER ROUTES */}
        {/* {sellerRoutes} */}

        {/* ✅ ADMIN ROUTES */}
        {/* {adminRoutes} */}

        {/* {buyerRoutes} */}

        {/* ✅ 404 - MUST BE LAST */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
