import { Metadata } from 'next';

import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { EmployeeBalances } from '@/components/dashboard/employee-balances';
import { EmployeePendingRequests } from '@/components/dashboard/employee-pending-requests';
import { ReackPrompt } from '@/components/policies/reack-prompt';

export const metadata: Metadata = { title: 'Dashboard' };

export default function EmployeeDashboardPage() {
  return (
    <>
      <DashboardGreeting />
      <ReackPrompt />
      <EmployeeBalances />
      <EmployeePendingRequests />
    </>
  );
}
