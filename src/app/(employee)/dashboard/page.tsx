import { Metadata } from 'next';

import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { EmployeeBalances } from '@/components/dashboard/employee-balances';
import { EmployeePendingRequests } from '@/components/dashboard/employee-pending-requests';

export const metadata: Metadata = { title: 'Dashboard' };

export default function EmployeeDashboardPage() {
  return (
    <>
      <DashboardGreeting />
      {/* The policy-acknowledgment banner was removed: Policies is still a
          Coming Soon feature with no backend, so it can be restored once that
          ships and a real acknowledgment source exists. */}
      <EmployeeBalances />
      <EmployeePendingRequests />
    </>
  );
}
