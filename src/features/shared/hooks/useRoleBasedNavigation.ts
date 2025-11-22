import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';

/**
 * Hook for role-aware navigation
 */
export function useRoleBasedNavigation() {
  const navigate = useNavigate();
  const { role, isSeller, isBuyer, isAdmin } = useUserRole();

  const goToDashboard = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  const goToOnboarding = () => {
    navigate('/user/onboarding');
  };

  const goToProfile = () => {
    navigate('/user/profile');
  };

  const goToKYCStatus = () => {
    navigate('/user/kyc-status');
  };

  return {
    role,
    goToDashboard,
    goToOnboarding,
    goToProfile,
    goToKYCStatus,
  };
}
