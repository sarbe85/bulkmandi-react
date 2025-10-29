import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
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
    AlertCircle,
    Bell,
    CheckCircle2,
    Clock,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SellerHeaderProps {
  kycStatus?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  showKYCBadge?: boolean;
}

const navigationItems = [
  { label: 'Dashboard', href: '/seller/dashboard' },
  { label: 'RFQs', href: '/seller/rfqs' },
  { label: 'Quotes', href: '/seller/quotes' },
  { label: 'Orders', href: '/seller/orders' },
  { label: 'KYC Status', href: '/seller/kyc-status' },
];

export default function SellerHeader({ kycStatus, showKYCBadge = true }: SellerHeaderProps) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState({
    name: 'Seller Name',
    email: 'seller@example.com',
  });

  useEffect(() => {
    // Get user data from storage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    // Get theme from storage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const getKYCBadgeDetails = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return {
          text: 'KYC Verified',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        };
      case 'SUBMITTED':
        return {
          text: 'KYC Pending',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case 'REJECTED':
        return {
          text: 'KYC Rejected',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          text: 'KYC Incomplete',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
        };
    }
  };

  const kycBadge = getKYCBadgeDetails();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BM</span>
            </div>
            <span className="hidden sm:inline">BulkMandi</span>
          </button>

          {/* KYC Status Badge */}
          {showKYCBadge && kycStatus && kycStatus !== 'APPROVED' && (
            <Badge
              variant="outline"
              className={`hidden md:flex items-center ${kycBadge.className}`}
            >
              {kycBadge.icon}
              {kycBadge.text}
            </Badge>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex ml-8 gap-6">
          {navigationItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs mt-1">
                    Seller
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/seller/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/seller/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/seller/kyc-status')}>
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>KYC Status</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {/* KYC Badge in Mobile */}
                {showKYCBadge && kycStatus && kycStatus !== 'APPROVED' && (
                  <Badge
                    variant="outline"
                    className={`flex items-center w-fit ${kycBadge.className}`}
                  >
                    {kycBadge.icon}
                    {kycBadge.text}
                  </Badge>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-3">
                  {navigationItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href);
                      }}
                      className="text-left text-sm font-medium transition-colors hover:text-primary py-2"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}