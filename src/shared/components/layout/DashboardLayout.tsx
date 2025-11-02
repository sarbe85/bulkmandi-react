/**
 * Dashboard Layout Component
 * Main layout wrapper with navigation and logout
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import {
  CheckCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Sun,
  Truck,
  User
} from 'lucide-react';
import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/seller/dashboard' },
    ];

   if (user?.role === 'ADMIN') {
    return [
      ...baseItems,
      { icon: User, label: 'Users', path: '/admin/users' },
      { icon: CheckCircle, label: 'Approvals', path: '/admin/approvals' },
      { icon: FileText, label: 'All RFQs', path: '/admin/rfqs' },
      { icon: Package, label: 'All Orders', path: '/admin/orders' },
    ];
  }

    if (user?.role === 'SELLER') {
    return [
      ...baseItems,
      { icon: FileText, label: 'RFQs', path: '/seller/rfqs' }, // CHANGED
      { icon: Package, label: 'My Quotes', path: '/seller/quotes' }, // CHANGED
      { icon: Truck, label: 'Orders', path: '/seller/orders' }, // CHANGED
      { icon: CheckCircle, label: 'KYC Status', path: '/seller/kyc-status' }, // CHANGED
    ];
  }

    if (user?.role === 'BUYER') {
      return [
        ...baseItems,
        { icon: FileText, label: 'My RFQs', path: '/buyer/rfqs' },
        { icon: Package, label: 'Quotes Received', path: '/buyer/quotes' },
        { icon: Truck, label: 'Orders', path: '/buyer/orders' },
      ];
    }

    if (user?.role === '3PL') {
      return [
        ...baseItems,
        { icon: Truck, label: 'Shipments', path: '/3pl/shipments' },
        { icon: Package, label: 'Deliveries', path: '/3pl/deliveries' },
        { icon: CheckCircle, label: 'Status', path: '/3pl/status' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={location.pathname === item.path ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => navigate(item.path)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Bulk Mandi</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 ml-8">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm">
                  {user?.organizationName || user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.organizationName || 'Organization'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/kyc-status')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                KYC Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
