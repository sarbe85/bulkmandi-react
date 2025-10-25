import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingData } from '@/types/onboarding.types';
import { Check, Loader2 } from 'lucide-react';

interface Props {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ReviewStep = ({ data, onSubmit, onBack, isLoading }: Props) => {
  const { orgKyc, bankDocs, catalog } = data;

  const checks = [
    { label: 'Organization KYC', completed: !!orgKyc },
    { label: 'GSTIN Verified', completed: !!orgKyc?.gstin },
    { label: 'PAN Details', completed: !!orgKyc?.pan },
    { label: 'Bank Account', completed: !!bankDocs?.accountNumber },
    { label: 'Documents Uploaded', completed: !!bankDocs?.documents && bankDocs.documents.length > 0 },
    { label: 'Catalog Setup', completed: !!catalog?.categories && catalog.categories.length > 0 },
  ];

  const allCompleted = checks.every(c => c.completed);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Review & Submit</h3>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4">Checklist</h4>
          <div className="flex flex-wrap gap-2">
            {checks.map(check => (
              <Badge
                key={check.label}
                variant={check.completed ? 'default' : 'secondary'}
                className={check.completed ? 'bg-success/10 text-success border-success/20' : ''}
              >
                {check.completed && <Check className="h-3 w-3 mr-1" />}
                {check.label}
              </Badge>
            ))}
          </div>
        </div>

        {orgKyc && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Organization Details</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Legal Name</dt>
                <dd className="font-medium">{orgKyc.legalName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">GSTIN</dt>
                <dd className="font-mono">{orgKyc.gstin}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">PAN</dt>
                <dd className="font-mono">{orgKyc.pan}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Plant Locations</dt>
                <dd>{orgKyc.plantLocations.length} location(s)</dd>
              </div>
            </dl>
          </Card>
        )}

        {bankDocs && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Bank Details</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Account Name</dt>
                <dd className="font-medium">{bankDocs.accountName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Account Number</dt>
                <dd className="font-mono">{bankDocs.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">IFSC</dt>
                <dd className="font-mono">{bankDocs.ifscCode}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Documents</dt>
                <dd>{bankDocs.documents.length} uploaded</dd>
              </div>
            </dl>
          </Card>
        )}

        {catalog && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Catalog</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Categories</dt>
                <dd>{catalog.categories.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Grades</dt>
                <dd>{catalog.grades.length} grade(s)</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">MOQ per Order</dt>
                <dd>{catalog.moqPerOrder} MT</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lead Time</dt>
                <dd>{catalog.standardLeadDays} days</dd>
              </div>
            </dl>
          </Card>
        )}

        <div className="bg-muted/30 border border-dashed rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            By submitting, you confirm that all information provided is accurate and complete. 
            Your application will be reviewed within 24-48 hours.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onSubmit} disabled={!allCompleted || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit for Verification
          </Button>
          <Button variant="outline" onClick={onBack} disabled={isLoading}>Back</Button>
        </div>
      </div>
    </Card>
  );
};
