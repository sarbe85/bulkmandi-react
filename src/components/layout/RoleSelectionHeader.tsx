import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionHeader = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - Clickable */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-400 font-bold text-primary-foreground">
            BM
          </div>
          <span className="text-xl font-bold">BulkMandi</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs text-muted-foreground">Logged in as</span>
                <span className="text-sm font-medium">{user?.organizationName}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/auth/login')}>
                Login
              </Button>
              <Button variant="outline">Help</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default RoleSelectionHeader;
