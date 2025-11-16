/**
 * Seller Header Component
 * Path: src/features/seller/components/SellerHeader.tsx
 */

import { useAuth } from '@/features/auth/hooks/useAuth';
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

interface SellerHeaderProps {
  kycStatus?: string; // ✅ CHANGED: Accept any string
  showKYCBadge?: boolean;
}

interface UserData {
  name: string;
  email: string;
  organizationName?: string;
}

const navigationItems = [
  { label: 'Dashboard', path: '/seller/dashboard' },
  { label: 'RFQs', path: '/seller/rfqs' },
  { label: 'Quotes', path: '/seller/quotes' },
  { label: 'Orders', path: '/seller/orders' },
  { label: 'KYC Status', path: '/seller/kyc-status' },
];

export default function SellerHeader({
  kycStatus,
  showKYCBadge = true,
}: SellerHeaderProps) {
  const navigate = useNavigate();
  const { logout, isLoading: isLoggingOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<UserData>({
    name: 'Seller Account',
    email: 'seller@example.com',
    organizationName: '',
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('📍 Parsed User Data:', parsed);

        setUser({
          name: parsed.organizationName || parsed.email || 'Seller Account',
          email: parsed.email || 'seller@example.com',
          organizationName: parsed.organizationName || '',
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      .matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      document.body.classList.add('bg-slate-950', 'text-white');
    } else {
      html.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-white');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    applyTheme(newDarkMode);
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      // if (success) {
      //   console.log('✅ Logout successful, redirecting...');
        navigate('/auth/login', { replace: true });
      // }
    } catch (error) {
      console.error('❌ Logout error:', error);
      navigate('/auth/login', { replace: true });
    }
  };

  // ✅ FIXED: Accept any string and provide sensible defaults
  const getKYCBadgeDetails = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return {
          text: 'KYC Verified',
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'SUBMITTED':
        return {
          text: 'KYC Pending',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'REJECTED':
        return {
          text: 'KYC Rejected',
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: '❌',
        };
      case 'DRAFT':
      default:
        return {
          text: 'KYC Incomplete',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '⚠️',
        };
    }
  };

  const kycBadge = getKYCBadgeDetails();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* LEFT: LOGO + NAVIGATION */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  BulkMandi
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Seller Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
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
              className="relative text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => console.log('Notifications clicked')}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
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
                  className="gap-2 px-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="px-4 py-4 border-b dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.organizationName || user.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="dark:bg-slate-700" />

                <DropdownMenuItem
                  onClick={() => navigate('/seller/profile')}
                  className="cursor-pointer dark:hover:bg-slate-700 dark:text-gray-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span>View Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/seller/settings')}
                  className="cursor-pointer dark:hover:bg-slate-700 dark:text-gray-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="dark:bg-slate-700" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-slate-700"
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
                  className="text-gray-700 dark:text-gray-300"
                  title="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-64 dark:bg-slate-900 dark:border-slate-700"
              >
                <div className="space-y-4 mt-6">
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">
                    Menu
                  </div>
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSheetOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
