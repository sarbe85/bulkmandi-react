/**
 * Risk Badge Component
 * Path: src/features/admin/components/RiskBadge.tsx
 */

import { RiskLevel } from '../types/admin-kyc.types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
}

export default function RiskBadge({ level, score }: RiskBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}
      >
        {level} Risk
      </span>
      {score !== undefined && (
        <span className="text-xs text-gray-600">Score: {score}</span>
      )}
    </div>
  );
}
