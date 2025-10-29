// src/features/admin/routes.tsx
import { Route } from 'react-router-dom';

import { AdminRoute } from '@/shared/components/auth/AdminRoute';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import KYCDetail from './pages/KYCDetail';
import KYCQueue from './pages/KYCQueue';

export const adminRoutes = (
  <>
    <Route
      path="dashboard"
      element={
        <ProtectedRoute>
          <AdminRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </AdminRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="kyc-queue"
      element={
        <ProtectedRoute>
          <AdminRoute>
            <DashboardLayout>
              <KYCQueue />
            </DashboardLayout>
          </AdminRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="kyc-detail/:id"
      element={
        <ProtectedRoute>
          <AdminRoute>
            <DashboardLayout>
              <KYCDetail />
            </DashboardLayout>
          </AdminRoute>
        </ProtectedRoute>
      }
    />
  </>
);
