import { Metadata } from 'next';

import { EmployeeBalances } from '@/components/dashboard/employee-balances';
import { EmployeePendingRequests } from '@/components/dashboard/employee-pending-requests';
import { PolicyAcknowledgmentBanner } from '@/components/dashboard/policy-acknowledgment-banner';
import { PageHeader } from '@/components/hrm/page-header';

import { mockCurrentEmployee } from '@/constants/mock/employees';

export const metadata: Metadata = { title: 'Dashboard' };

export default function EmployeeDashboardPage() {
  const firstName = mockCurrentEmployee.fullName.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description='Your balances, requests, and payslips at a glance.'
      />
      <PolicyAcknowledgmentBanner />
      <EmployeeBalances />
      <EmployeePendingRequests />
    </>
  );
}
