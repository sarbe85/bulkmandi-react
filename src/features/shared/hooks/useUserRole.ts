import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Hook to get user role information
 */
export function useUserRole() {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  return {
    role: user?.role,
    isSeller: user?.role === 'SELLER',
    isBuyer: user?.role === 'BUYER',
    isAdmin: user?.role === 'ADMIN',
    is3PL: user?.role === '3PL',
    hasRole: (role: string) => user?.role === role,
  };
}
