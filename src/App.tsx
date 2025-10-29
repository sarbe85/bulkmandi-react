import { adminRoutes } from '@/features/admin/routes';
import { sellerRoutes } from '@/features/seller/routes';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import RoleSelection from './pages/RoleSelection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
         {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/get-started" element={<RoleSelection />} />

        {/* Legacy Redirects */}
        <Route path="/dashboard" element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="/onboarding" element={<Navigate to="/seller/onboarding" replace />} />

        {/* Feature Routes */}
        <Route path="/seller/*">{sellerRoutes}</Route>
        <Route path="/admin/*">{adminRoutes}</Route>
        {/* <Route path="/buyer/*">{buyerRoutes}</Route> */}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
