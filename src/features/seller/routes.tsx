import { Route } from 'react-router-dom';
import SellerLayout from '../shared/components/layout/Layout';
import KYCStatus from '../shared/pages/KYCStatus';
import Onboarding from '../shared/pages/Onboarding';
import OrdersList from '../shared/pages/OrdersList';
import Profile from '../shared/pages/Profile';
import QuotesList from '../shared/pages/QuotesList';
import RFQDetail from '../shared/pages/RFQDetail';
import RFQList from '../shared/pages/RFQList';
import Dashboard from './pages/SellerDashboard';

// ✅ Layout Route with nested children
export const sellerRoutes = (
  <Route path="/seller" element={<SellerLayout />}>
    <Route index element={<Dashboard />} /> {/* Default /seller route */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="kyc-status" element={<KYCStatus />} />
    <Route path="profile" element={<Profile />} />
    <Route path="onboarding" element={<Onboarding />} />
    <Route path="rfqs" element={<RFQList />} />
    <Route path="rfqs/:id" element={<RFQDetail />} />
    <Route path="quotes" element={<QuotesList />} />
    <Route path="orders" element={<OrdersList />} />
  </Route>
);
