/**
 * KYC Card Component
 * Path: src/features/admin/components/KYCCard.tsx
 */

import { Card } from '@/shared/components/ui/card';
import { Building2, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KYCQueueItem } from '../types/admin-kyc.types';
import RiskBadge from './RiskBadge';

interface KYCCardProps {
  item: KYCQueueItem;
}

export default function KYCCard({ item }: KYCCardProps) {
  const navigate = useNavigate();

  const getRoleBadgeColor = () => {
    switch (item.role) {
      case 'SELLER':
        return 'bg-blue-100 text-blue-800';
      case 'BUYER':
        return 'bg-purple-100 text-purple-800';
      case '3PL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => navigate(`/admin/kyc/case/${item.caseId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">{item.orgName}</h3>
          </div>
          <p className="text-xs text-gray-500">
            {item.submissionNumber} • Submitted {item.age} ago
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
          {item.role}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-600">GSTIN:</span>
          <p className="font-mono text-xs text-gray-900">{item.gstin}</p>
        </div>
        <div>
          <span className="text-gray-600">PAN:</span>
          <p className="font-mono text-xs text-gray-900">{item.pan}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {item.bankVerified ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              <span>Bank Verified ({item.bankScore})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <Clock className="h-3 w-3" />
              <span>Bank Pending</span>
            </div>
          )}
        </div>
        <RiskBadge level={item.riskLevel} />
      </div>
    </Card>
  );
}
