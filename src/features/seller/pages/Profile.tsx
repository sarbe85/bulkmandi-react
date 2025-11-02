import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Building2, Edit2, FileText, Mail, MapPin, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

export default function SellerProfile() {
  const [user] = useState({
    name: 'Seller Account',
    email: 'seller@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    joinDate: 'Oct 15, 2024',
    companyName: 'Your Company Ltd.',
    companyType: 'Distributor',
    kycStatus: 'APPROVED' as const,
  });

  const getKYCColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your seller account information
          </p>
        </div>

        {/* Profile Card */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Header Background */}
          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row gap-6 -mt-12 mb-6">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {user.companyName}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    className={`${getKYCColor(user.kycStatus)} border`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    KYC {user.kycStatus}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 border">
                    {user.companyType}
                  </Badge>
                </div>
              </div>

              <Button className="sm:self-start gap-2 bg-blue-600 hover:bg-blue-700">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            <hr className="dark:border-slate-700 my-6" />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Location
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Company Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.companyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Company Type
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.companyType}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Member Since
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.joinDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="dark:border-slate-700 my-6" />

            {/* Account Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">24</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Active RFQs
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-green-600">156</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Total Orders
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">4.8★</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Rating
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Actions */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Two-Factor Authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Download Account Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
