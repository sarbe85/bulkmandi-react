import { Route } from 'react-router-dom';
import SellerLayout from './layout/SellerLayout';
import Dashboard from './pages/Dashboard';
import KYCStatus from './pages/KYCStatus';
import Onboarding from './pages/Onboarding';
import OrdersList from './pages/OrdersList';
import SellerProfile from './pages/Profile';
import QuotesList from './pages/QuotesList';
import RFQDetail from './pages/RFQDetail';
import RFQList from './pages/RFQList';

// ✅ Layout Route with nested children
export const sellerRoutes = (
  <Route path="/seller" element={<SellerLayout />}>
    <Route index element={<Dashboard />} /> {/* Default /seller route */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="kyc-status" element={<KYCStatus />} />
    <Route path="profile" element={<SellerProfile />} />
    <Route path="onboarding" element={<Onboarding />} />
    <Route path="rfqs" element={<RFQList />} />
    <Route path="rfqs/:id" element={<RFQDetail />} />
    <Route path="quotes" element={<QuotesList />} />
    <Route path="orders" element={<OrdersList />} />
  </Route>
);
