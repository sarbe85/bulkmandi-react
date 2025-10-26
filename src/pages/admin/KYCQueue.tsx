import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/admin.service';
import { Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KYCItem {
  id: string;
  organizationName: string;
  submittedAt: string;
  gstin: string;
  status: 'pending' | 'reviewing';
}

export default function KYCQueue() {
  const navigate = useNavigate();
  const [kycQueue, setKycQueue] = useState<KYCItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKYCQueue();
  }, []);

  const loadKYCQueue = async () => {
    try {
      const pending = await adminService.getPendingKYC();
      
      const queue = pending.map((org: any) => ({
        id: org._id,
        organizationName: org.legalName,
        submittedAt: org.submittedAt || org.updatedAt,
        gstin: org.orgKyc?.gstin || 'N/A',
        status: 'pending' as const,
      }));
      
      setKycQueue(queue);
    } catch (error) {
      console.error('Failed to load KYC queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve seller onboarding submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions ({kycQueue.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {kycQueue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No pending KYC submissions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.organizationName}</TableCell>
                    <TableCell className="font-mono text-sm">{item.gstin}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'pending' ? 'secondary' : 'default'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/kyc/${item.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
