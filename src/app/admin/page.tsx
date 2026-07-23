import { Metadata } from 'next';

import { AdminPendingQueue } from '@/components/dashboard/admin-pending-queue';
import { LeaveBalancesPanel } from '@/components/dashboard/leave-balances-panel';
import { PayrollCostWidget } from '@/components/dashboard/payroll-cost-widget';
import { SummaryTiles } from '@/components/dashboard/summary-tiles';
import { PageHeader } from '@/components/hrm/page-header';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title='Admin Dashboard'
        description='Pending approvals, payroll status, and employee overview.'
      />
      <SummaryTiles />
      <PayrollCostWidget />
      <LeaveBalancesPanel />
      <AdminPendingQueue />
    </>
  );
}
