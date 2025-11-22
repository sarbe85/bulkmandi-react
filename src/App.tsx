import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Public pages
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import Dashboard from '@/features/common/pages/Dashboard';
import GetStarted from '@/features/common/pages/GetStarted';
import NotFound from '@/features/common/pages/NotFound';
import RoleSelection from '@/features/common/pages/RoleSelection';
import Index from '@/index';

// Generic user pages
import UserDashboard from '@/features/dashboard/components/UserDashboard';
import OnboardingPage from '@/features/shared/pages/Onboarding';

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
        
        {/* ✅ GENERIC USER ROUTES */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/onboarding" element={<OnboardingPage />} />

        {/* ✅ LEGACY ROUTES - Redirect to generic */}
        <Route path="/seller/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/buyer/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/seller/onboarding" element={<Navigate to="/user/onboarding" replace />} />
        <Route path="/buyer/onboarding" element={<Navigate to="/user/onboarding" replace />} />

        {/* ✅ ADMIN ROUTES */}
        {/* {adminRoutes} */}

        {/* ✅ 404 - MUST BE LAST */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
