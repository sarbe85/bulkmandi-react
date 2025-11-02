/**
 * Admin Routes Configuration
 * Path: src/features/admin/routes.tsx
 */

import { Navigate, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import KYCDetail from './pages/KYCDetail';
import KYCQueue from './pages/KYCQueue';

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="kyc">
      <Route path="queue" element={<KYCQueue />} />
      <Route path="case/:caseId" element={<KYCDetail />} />
    </Route>
    {/* Default redirect */}
    <Route index element={<Navigate to="dashboard" replace />} />
  </Route>
);
