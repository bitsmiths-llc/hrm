import { FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { EmployeeBalances } from '@/components/dashboard/employee-balances';
import { EmployeePendingRequests } from '@/components/dashboard/employee-pending-requests';
import { PageHeader } from '@/components/hrm/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { mockCurrentEmployee } from '@/constants/mock/employees';
import { mockPolicies } from '@/constants/mock/policies';
import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Dashboard' };

export default function EmployeeDashboardPage() {
  const firstName = mockCurrentEmployee.fullName.split(' ')[0];
  const unacknowledged = mockPolicies.filter((p) => !p.acknowledged);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description='Your balances, requests, and payslips at a glance.'
      />
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
