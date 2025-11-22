import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import {
  Bell,
  CheckCircle2,
  Clock,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SharedHeaderProps {
  kycStatus?: string;
  showKYCBadge?: boolean;
  userType?: 'SELLER' | 'BUYER' | 'LOGISTICS';
}

interface UserData {
  name: string;
  email: string;
  organizationName?: string;
  role?: string;
}

export default function SharedHeader({
  kycStatus,
  showKYCBadge = true,
  userType,
}: SharedHeaderProps) {
  const navigate = useNavigate();
  const { logout, isLoading: isLoggingOut, getCurrentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserData>({
    name: 'User Account',
    email: 'user@example.com',
    organizationName: '',
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  // Determine user type from auth or prop
  const currentUser = getCurrentUser();
  const role = userType || currentUser?.role || 'SELLER';

  // Define navigation items - now using generic /user/* paths
  const navigationItems = [
    { label: 'Dashboard', path: '/user/dashboard' },
    { label: 'RFQs', path: '/user/rfqs' },
    { label: 'Quotes', path: '/user/quotes' },
    { label: 'Orders', path: '/user/orders' },
    { label: 'KYC Status', path: '/user/kyc-status' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          name: parsed.organizationName || parsed.email || 'User Account',
          email: parsed.email || 'user@example.com',
          organizationName: parsed.organizationName || '',
          role: parsed.role || role,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [role]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      navigate('/auth/login', { replace: true });
    }
  };

  const getKYCBadgeDetails = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return {
          text: 'KYC Verified',
          className: 'bg-success/10 text-success border-success/30',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'SUBMITTED':
        return {
          text: 'KYC Pending',
          className: 'bg-primary/10 text-primary border-primary/30',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'REJECTED':
        return {
          text: 'KYC Rejected',
          className: 'bg-destructive/10 text-destructive border-destructive/30',
          icon: '❌',
        };
      case 'DRAFT':
      default:
        return {
          text: 'KYC Incomplete',
          className: 'bg-warning/10 text-warning border-warning/30',
          icon: '⚠️',
        };
    }
  };

  const kycBadge = getKYCBadgeDetails();
  const portalName = role === 'SELLER' ? 'Seller Portal' : role === 'BUYER' ? 'Buyer Portal' : 'Logistics Portal';

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* LEFT: LOGO + NAVIGATION */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">
                  BulkMandi
                </h1>
                <p className="text-xs text-muted-foreground">
                  {portalName}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="flex items-center gap-3">
            {/* KYC Badge */}
            {showKYCBadge && (
              <Badge
                className={`${kycBadge.className} border gap-2 hidden sm:flex`}
              >
                {typeof kycBadge.icon === 'string' ? (
                  <span>{kycBadge.icon}</span>
                ) : (
                  kycBadge.icon
                )}
                {kycBadge.text}
              </Badge>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted"
              onClick={() => console.log('Notifications clicked')}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-muted"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 px-2 hover:bg-muted"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold truncate max-w-[150px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72"
              >
                <div className="px-4 py-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {user.organizationName || user.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate('/user/profile')}
                  className="cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span>View Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/user/settings')}
                  className="cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-64"
              >
                <div className="space-y-4 mt-6">
                  <div className="font-semibold text-lg">
                    Menu
                  </div>
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSheetOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
