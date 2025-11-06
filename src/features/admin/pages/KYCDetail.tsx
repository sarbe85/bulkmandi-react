/**
 * KYC Detail Page
 * Path: src/features/admin/pages/KYCDetail.tsx
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  History,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import adminKYCService from '../services/admin-kyc.service';
import { KYCCaseDetail } from '../types/admin-kyc.types';

export default function KYCDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseDetail, setCaseDetail] = useState<KYCCaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (caseId) {
      loadCaseDetail();
    }
  }, [caseId]);

  const loadCaseDetail = async () => {
    try {
      setIsLoading(true);
      const data = await adminKYCService.getKYCCaseDetail(caseId!);
      setCaseDetail(data);
    } catch (error: any) {
      console.error('Failed to load case detail:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await adminKYCService.approveKYC(caseId!, {
        remarks: approveRemarks || 'All documents verified successfully',
      });

      toast({
        title: 'KYC Approved',
        description: 'Organization has been verified and activated',
      });

      navigate('/admin/kyc/queue');
    } catch (error: any) {
      console.error('Failed to approve KYC:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve KYC',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a detailed reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await adminKYCService.rejectKYC(caseId!, {
        rejectionReason: rejectionReason,
      });

      toast({
        title: 'KYC Rejected',
        description: 'Seller has been notified and can resubmit',
      });

      navigate('/admin/kyc/queue');
    } catch (error: any) {
      console.error('Failed to reject KYC:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject KYC',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Case not found</p>
        <Button onClick={() => navigate('/admin/kyc/queue')} className="mt-4">
          Back to Queue
        </Button>
      </div>
    );
  }

  const { case: caseInfo, organization, contacts, bankAccount, complianceDocuments, autoChecks, riskAssessment } = caseDetail;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/kyc/queue')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Queue
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organization.legalName}</h1>
                <p className="text-sm text-gray-600">{caseInfo.submissionNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RiskBadge level={riskAssessment.level} score={riskAssessment.score} />
              <span className="text-sm text-gray-600">
                Submitted {caseInfo.age} ago • SLA: {caseInfo.sla.tat}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Auto Checks Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Checks</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(autoChecks).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Organization Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Legal Name</p>
                  <p className="font-medium text-gray-900">{organization.legalName}</p>
                </div>
                {organization.tradeName && (
                  <div>
                    <p className="text-gray-600">Trade Name</p>
                    <p className="font-medium text-gray-900">{organization.tradeName}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">GSTIN</p>
                  <p className="font-mono text-gray-900">{organization.gstin}</p>
                </div>
                <div>
                  <p className="text-gray-600">PAN</p>
                  <p className="font-mono text-gray-900">{organization.pan}</p>
                </div>
                {organization.cin && (
                  <div>
                    <p className="text-gray-600">CIN</p>
                    <p className="font-mono text-gray-900">{organization.cin}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Business Type</p>
                  <p className="font-medium text-gray-900">{organization.businessType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Incorporation Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(organization.incorporationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Registered Address</p>
                  <p className="font-medium text-gray-900">{organization.registeredAddress}</p>
                </div>
              </div>
            </Card>

            {/* Contacts */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Primary Contact</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{contacts.primary.name}</span>
                      <Badge variant="outline">{contacts.primary.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{contacts.primary.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{contacts.primary.mobile}</span>
                    </div>
                  </div>
                </div>

                {contacts.secondary && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Secondary Contact</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{contacts.secondary.name}</span>
                        <Badge variant="outline">{contacts.secondary.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{contacts.secondary.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{contacts.secondary.mobile}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Bank Account */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Account
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Account Holder</p>
                  <p className="font-medium text-gray-900">{bankAccount.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Number</p>
                  <p className="font-mono text-gray-900">****{bankAccount.accountNumber.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-gray-600">IFSC Code</p>
                  <p className="font-mono text-gray-900">{bankAccount.ifsc}</p>
                </div>
                <div>
                  <p className="text-gray-600">Bank Name</p>
                  <p className="font-medium text-gray-900">{bankAccount.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-medium text-gray-900">{bankAccount.accountType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Penny Drop Status</p>
                  <div className="flex items-center gap-2">
                    {bankAccount.pennyDropStatus === 'VERIFIED' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">Verified ({bankAccount.pennyDropScore})</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-700 font-medium">{bankAccount.pennyDropStatus}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {bankAccount.documents.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Bank Documents</p>
                  <div className="space-y-2">
                    {bankAccount.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{doc.docType.replace(/_/g, ' ')}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Compliance Documents */}
            {complianceDocuments.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Documents
                </h2>
                <div className="space-y-2">
                  {complianceDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.docType.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-600">{doc.fileName}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Document
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* RIGHT COLUMN - Actions & Summary */}
          <div className="space-y-6">
            
            {/* Risk Assessment */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
              <div className="space-y-3">
                <RiskBadge level={riskAssessment.level} score={riskAssessment.score} />
                <p className="text-sm text-gray-700">{riskAssessment.remarks}</p>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowApproveModal(true)}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve KYC
                </Button>

                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject KYC
                </Button>

                <Button variant="outline" className="w-full gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Request More Info
                </Button>

                <Button variant="outline" className="w-full gap-2">
                  <History className="h-4 w-4" />
                  View History
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Approve KYC Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will activate the organization and grant full platform access.
            </p>
            <Textarea
              placeholder="Optional remarks (e.g., All documents verified successfully)"
              value={approveRemarks}
              onChange={(e) => setApproveRemarks(e.target.value)}
              rows={3}
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowApproveModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject KYC Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a detailed reason for rejection. The seller will be notified.
            </p>
            <Textarea
              placeholder="Rejection reason (required)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="mb-4"
              required
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
