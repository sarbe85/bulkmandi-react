import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

interface Props {
  data: any;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

export default function ReviewStep({
  data,
  onSubmit,
  onBack,
}: Props) {
  if (!data || !data.orgKyc) {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-yellow-600">
          <p>Unable to load review data. Please go back and complete all steps.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Review Your Information</h1>
          <p className="text-gray-600">Please review all information before submitting your application</p>
        </div>

        <div className="space-y-6">
          {/* Organization KYC */}
          {data.orgKyc && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Legal Name</p>
                  <p className="font-medium">{data.orgKyc.legalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trade Name</p>
                  <p className="font-medium">{data.orgKyc.tradeName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GSTIN</p>
                  <p className="font-medium">{data.orgKyc.gstin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PAN</p>
                  <p className="font-medium">{data.orgKyc.pan}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details */}
          {data.primaryBankAccount && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Account Holder</p>
                  <p className="font-medium">{data.primaryBankAccount.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-medium">{data.primaryBankAccount.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">****{data.primaryBankAccount.accountNumber.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IFSC</p>
                  <p className="font-medium">{data.primaryBankAccount.ifsc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-blue-900">📋 Confirmation Required:</p>
          <p className="text-blue-800 text-sm">
            By submitting this application, you confirm that all information provided is accurate and complete. Your application will be reviewed by our team within 24-48 hours.
          </p>
          <p className="font-semibold text-blue-900 mt-2">🔒 Data Lock Notice:</p>
          <p className="text-blue-800 text-sm">
            Once submitted, you won't be able to edit the information until admin reviews your application.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onSubmit} className="flex-1">
            Submit Application 📬
          </Button>
        </div>
      </div>
    </Card>
  );
}
