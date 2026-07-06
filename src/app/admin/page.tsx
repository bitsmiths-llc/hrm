import { Metadata } from 'next';

import { AdminPendingQueue } from '@/components/dashboard/admin-pending-queue';
import { AdminStats } from '@/components/dashboard/admin-stats';
import { PageHeader } from '@/components/hrm/page-header';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title='Admin Dashboard'
        description='Pending approvals, payroll status, and employee overview.'
      />
      <AdminStats />
      <AdminPendingQueue />
    </>
  );
}
