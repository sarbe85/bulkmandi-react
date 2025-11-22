import { useAuth } from '@/features/auth/hooks/useAuth';
import SharedHeader from '@/features/shared/components/layout/SharedHeader';
import { useOnboarding } from '@/features/shared/hooks/useOnboarding';
import { useEffect } from 'react';
import BuyerWidgets from './widgets/BuyerWidgets';
import SellerWidgets from './widgets/SellerWidgets';

export default function UserDashboard() {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const { data, fetchData } = useOnboarding();

  useEffect(() => {
    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view dashboard</p>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (user.role) {
      case 'BUYER':
        return <BuyerWidgets user={user} kycStatus={data?.kycStatus} />;
      case 'SELLER':
        return <SellerWidgets user={user} kycStatus={data?.kycStatus} />;
      default:
        return (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Dashboard not available for your role</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader
        kycStatus={data?.kycStatus}
        showKYCBadge={true}
        userType={user.role as any}
      />
      <div className="container mx-auto px-4 py-8">
        {renderDashboardContent()}
      </div>
    </div>
  );
}
