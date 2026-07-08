import { FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { EmployeeBalances } from '@/components/dashboard/employee-balances';
import { EmployeePendingRequests } from '@/components/dashboard/employee-pending-requests';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { mockPolicies } from '@/constants/mock/policies';
import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Dashboard' };

export default function EmployeeDashboardPage() {
  const unacknowledged = mockPolicies.filter((p) => !p.acknowledged);

  return (
    <>
      <DashboardGreeting />
      {unacknowledged.length > 0 && (
        <Card>
          <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <FileText className='size-5 text-primary' aria-hidden />
              <p className='text-sm'>
                {unacknowledged.length} updated{' '}
                {unacknowledged.length === 1 ? 'policy needs' : 'policies need'}{' '}
                your acknowledgment.
              </p>
            </div>
            <Link href={paths.employee.policies}>
              <Button size='sm' variant='outline'>
                Review policies
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      <EmployeeBalances />
      <EmployeePendingRequests />
    </>
  );
}
