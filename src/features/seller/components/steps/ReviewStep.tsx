import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ReviewStep = ({ data, onSubmit, onBack, isLoading }: Props) => {
  const { orgKyc, bankDocs, complianceDocs, catalog } = data;

  const checks = [
    { label: 'Organization KYC', completed: !!orgKyc },
    { label: 'GSTIN Verified', completed: !!orgKyc?.gstin },
    { label: 'PAN Details', completed: !!orgKyc?.pan },
    { label: 'Bank Account', completed: !!bankDocs?.accountNumber },
    { label: 'Bank Documents', completed: !!bankDocs?.documents?.length },
    { label: 'Compliance Documents', completed: !!complianceDocs?.complianceDocuments?.length },
    { label: 'Catalog Setup', completed: !!catalog?.catalog?.length },
  ];

  const allCompleted = checks.every((c) => c.completed);

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Onboarding Checklist</h3>
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded border flex items-center justify-center ${
                  check.completed
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300'
                }`}
              >
                {check.completed && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span
                className={
                  check.completed
                    ? 'text-green-600 font-medium'
                    : 'text-gray-600'
                }
              >
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Organization Details */}
      {orgKyc && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Organization Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Legal Name</p>
              <p className="font-medium">{orgKyc.legalName}</p>
            </div>
            <div>
              <p className="text-gray-600">GSTIN</p>
              <p className="font-mono">{orgKyc.gstin}</p>
            </div>
            <div>
              <p className="text-gray-600">PAN</p>
              <p className="font-mono">{orgKyc.pan}</p>
            </div>
            <div>
              <p className="text-gray-600">Plant Locations</p>
              <p className="font-medium">{orgKyc.plantLocations?.length || 0}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Bank Details */}
      {bankDocs && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Bank Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Account Holder</p>
              <p className="font-medium">{bankDocs.accountName}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Number</p>
              <p className="font-mono">{bankDocs.accountNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">IFSC</p>
              <p className="font-mono">{bankDocs.ifscCode}</p>
            </div>
            <div>
              <p className="text-gray-600">Documents</p>
              <p className="font-medium">{bankDocs.documents?.length || 0} uploaded</p>
            </div>
          </div>
        </Card>
      )}

      {/* Compliance Documents */}
      {complianceDocs && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Compliance Documents</h4>
          <div className="space-y-2">
            {complianceDocs.complianceDocuments?.map((doc) => (
              <div key={doc.type} className="flex items-center justify-between text-sm">
                <span>{doc.type.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="bg-green-50">
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Catalog */}
      {catalog && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Catalog</h4>
          <div className="text-sm">
            <p className="text-gray-600 mb-2">Selected Categories</p>
            <div className="flex flex-wrap gap-2">
              {catalog.catalog
                ?.filter((c) => c.isSelected)
                .map((c) => (
                  <Badge key={c.category} variant="secondary">
                    {c.category}
                  </Badge>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          ✓ By submitting, you confirm all information is accurate and complete.
          Your application will be reviewed within 24-48 hours.
        </p>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!allCompleted || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit for Verification'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
