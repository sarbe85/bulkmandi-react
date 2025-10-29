/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  FileText,
  Package,
  Shield,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerHeader from '../components/SellerHeader';
import { onboardingService } from '../services/onboarding.service';
import { OnboardingReviewResponse } from '../types/onboarding.types';

interface KYCStatusData extends OnboardingReviewResponse {
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export default function KYCStatus() {
  const navigate = useNavigate();
  const [data, setData] = useState<KYCStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const [reviewData, statusData] = await Promise.all([
        onboardingService.getOnboardingReview(),
        onboardingService.getOnboardingStatus(),
      ]);

      setData({
        ...reviewData,
        kycStatus: statusData.kycStatus as any,
        rejectionReason: statusData.rejectionReason,
      });
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDetails = () => {
    switch (data?.kycStatus) {
      case 'APPROVED':
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          title: 'KYC Approved ✅',
          description: 'Congratulations! Your account is fully verified.',
          showEdit: false,
        };
      case 'SUBMITTED':
        return {
          color: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          icon: <Clock className="h-6 w-6 text-blue-600" />,
          title: 'KYC Under Review',
          description: 'Your application is being reviewed by our team.',
          showEdit: false,
        };
      case 'REJECTED':
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          title: 'KYC Rejected',
          description: 'Please review the feedback and update your application.',
          showEdit: true,
        };
      default:
        return {
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          title: 'KYC Incomplete',
          description: 'Please complete your KYC to access all features.',
          showEdit: true,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerHeader kycStatus={data?.kycStatus} />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-6 max-w-md">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KYC Data Found</h3>
              <p className="text-gray-600 mb-4">Please start your KYC process.</p>
              <Button onClick={() => navigate('/seller/onboarding')}>
                Start KYC Process
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader kycStatus={data.kycStatus} showKYCBadge />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <Card className={`mb-8 border-2 ${statusDetails.color}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {statusDetails.icon}
                <div>
                  <h1 className={`text-2xl font-bold ${statusDetails.textColor}`}>
                    {statusDetails.title}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    {statusDetails.description}
                  </p>
                  {data.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {data.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {statusDetails.showEdit && (
                <Button onClick={() => navigate('/seller/onboarding')}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {data.kycStatus === 'REJECTED' ? 'Update KYC' : 'Complete KYC'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              KYC Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { key: 'orgKyc', label: 'Organization', icon: Building },
                { key: 'bankDetails', label: 'Bank Details', icon: CreditCard },
                { key: 'docs', label: 'Documents', icon: FileText },
                { key: 'catalog', label: 'Catalog', icon: Package },
                { key: 'review', label: 'Review', icon: Shield },
              ].map((step) => {
                const isCompleted = data.completedSteps.includes(step.key);
                const Icon = step.icon;

                return (
                  <div key={step.key} className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Details */}
          {data.orgKyc && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                {statusDetails.showEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/seller/onboarding?step=org-kyc')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Legal Name</p>
                  <p className="font-semibold">{data.orgKyc.legalName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">GSTIN</p>
                  <p className="font-mono">{data.orgKyc.gstin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">PAN</p>
                  <p className="font-mono">{data.orgKyc.pan}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Plant Locations</p>
                  <p className="font-semibold">
                    {data.orgKyc.plantLocations?.length || 0} locations
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {data.primaryBankAccount && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Details
                </CardTitle>
                {statusDetails.showEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/seller/onboarding?step=bank-details')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Holder</p>
                  <p className="font-semibold">
                    {data.primaryBankAccount.accountHolderName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Number</p>
                  <p className="font-mono">
                    ****{data.primaryBankAccount.accountNumber.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">IFSC Code</p>
                  <p className="font-mono">{data.primaryBankAccount.ifsc}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Bank Name</p>
                  <p className="font-semibold">{data.primaryBankAccount.bankName}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Documents */}
          {data.complianceDocuments && data.complianceDocuments.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Documents
                </CardTitle>
                {statusDetails.showEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate('/seller/onboarding?step=compliance-docs')
                    }
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.complianceDocuments.map((doc) => (
                    <div
                      key={doc.type}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {doc.type
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      {doc.status === 'UPLOADED' ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Catalog */}
          {data.catalog && data.catalog.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Catalog
                </CardTitle>
                {statusDetails.showEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/seller/onboarding?step=catalog')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.catalog.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-gray-600">
                          Grades: {item.grades.join(', ')}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="outline" onClick={() => navigate('/seller/dashboard')}>
            Back to Dashboard
          </Button>
          {statusDetails.showEdit && (
            <Button onClick={() => navigate('/seller/onboarding')}>
              <Edit2 className="h-4 w-4 mr-2" />
              {data.kycStatus === 'REJECTED' ? 'Update KYC' : 'Continue KYC'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}