// features/seller/routes.tsx
import { Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KYCStatus from './pages/KYCStatus';
import Onboarding from './pages/Onboarding';
// ... other seller pages

export const sellerRoutes = (
  <>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="onboarding" element={<Onboarding />} />
    <Route path="kyc-status" element={<KYCStatus />} />
    {/* Add more seller routes here */}
  </>
);
