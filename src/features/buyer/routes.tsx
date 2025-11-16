// src/features/buyer/routes.tsx

import { Route } from 'react-router-dom';
import BuyerLayout from './components/layout/BuyerLayout';
import Dashboard from './pages/Dashboard';
import KYCStatusView from './pages/KYCStatusView';
import OnboardingPage from './pages/OnboardingPage';

// ✅ Layout Route with nested children (matching seller pattern)
export const buyerRoutes = (
  <Route path="/buyer" element={<BuyerLayout />}>
    <Route index element={<Dashboard />} /> {/* Default /buyer route */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="kyc-status" element={<KYCStatusView />} />
    <Route path="onboarding" element={<OnboardingPage />} />
  </Route>
);
