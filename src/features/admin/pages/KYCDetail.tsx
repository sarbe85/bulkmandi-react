/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/admin.service';

export default function KYCDetail() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (orgId) {
      loadKYCDetails();
    }
  }, [orgId]);

  const loadKYCDetails = async () => {
    if (!orgId) return;
    
    try {
      const data = await adminService.getKYCDetails(orgId);
      setOrganization(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load KYC details',
        variant: 'destructive',
      });
      navigate('/admin/kyc');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!remarks.trim()) {
      toast({
        title: 'Remarks Required',
        description: 'Please provide approval remarks',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.approveKYC(orgId!, remarks);
      
      toast({
        title: 'KYC Approved',
        description: 'Organization has been successfully verified',
      });
      
      navigate('/admin/kyc');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve KYC',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast({
        title: 'Remarks Required',
        description: 'Please provide rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.rejectKYC(orgId!, remarks);
      
      toast({
        title: 'KYC Rejected',
        description: 'Organization has been notified',
      });
      
      navigate('/admin/kyc');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject KYC',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const { orgKyc, primaryBankAccount } = organization;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/kyc')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{organization.legalName}</h1>
            <p className="text-muted-foreground">KYC Case Review</p>
          </div>
        </div>
        <Badge variant={organization.kycStatus === 'SUBMITTED' ? 'default' : 'secondary'}>
          {organization.kycStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization KYC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Legal Name</Label>
                  <p className="font-medium">{orgKyc?.legalName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trade Name</Label>
                  <p className="font-medium">{orgKyc?.tradeName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">GSTIN</Label>
                  <p className="font-medium">{orgKyc?.gstin}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PAN</Label>
                  <p className="font-medium">{orgKyc?.pan}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Business Type</Label>
                  <p className="font-medium">{orgKyc?.businessType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Incorporation Date</Label>
                  <p className="font-medium">
                    {orgKyc?.incorporationDate ? new Date(orgKyc.incorporationDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Registered Address</Label>
                <p className="font-medium">{orgKyc?.registeredAddress}</p>
              </div>

              {orgKyc?.primaryContact && (
                <div>
                  <Label className="text-muted-foreground">Primary Contact</Label>
                  <div className="mt-2 space-y-1">
                    <p className="font-medium">{orgKyc.primaryContact.name}</p>
                    <p className="text-sm">{orgKyc.primaryContact.email}</p>
                    <p className="text-sm">{orgKyc.primaryContact.mobile}</p>
                  </div>
                </div>
              )}

              {orgKyc?.plantLocations && orgKyc.plantLocations.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Plant Locations</Label>
                  <div className="mt-2 space-y-2">
                    {orgKyc.plantLocations.map((plant: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{plant.name || `Plant ${idx + 1}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {plant.city}, {plant.state} - {plant.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryBankAccount ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Account Holder</Label>
                      <p className="font-medium">{primaryBankAccount.accountHolderName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Account Number</Label>
                      <p className="font-medium">{primaryBankAccount.accountNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">IFSC Code</Label>
                      <p className="font-medium">{primaryBankAccount.ifsc}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bank Name</Label>
                      <p className="font-medium">{primaryBankAccount.bankName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Penny Drop Status</Label>
                      <Badge variant={primaryBankAccount.pennyDropStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                        {primaryBankAccount.pennyDropStatus}
                      </Badge>
                    </div>
                  </div>

                  {primaryBankAccount.documents && primaryBankAccount.documents.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Documents</Label>
                      <div className="mt-2 space-y-2">
                        {primaryBankAccount.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <div>
                                <p className="font-medium text-sm">{doc.type}</p>
                                <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{doc.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No bank details provided</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="remarks">Remarks *</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter your review remarks..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleApprove} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve KYC
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleReject} 
                  disabled={isProcessing}
                  variant="destructive"
                  className="w-full"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject KYC
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <Label className="text-muted-foreground">Submitted At</Label>
                <p>{new Date(organization.submittedAt || organization.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Organization ID</Label>
                <p className="font-mono text-xs">{organization._id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Completed Steps</Label>
                <p>{organization.completedSteps?.join(', ') || 'None'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
