import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { LeaveBalanceCards } from '@/components/leave/leave-balance-cards';
import { LeaveHistoryTable } from '@/components/leave/leave-history-table';
import { RequestLeaveDialog } from '@/components/leave/request-leave-dialog';

export const metadata: Metadata = { title: 'Leave' };

export default function LeavePage() {
  return (
    <>
      <PageHeader
        title='Leave'
        description='Request leave and track your 22-day pool.'
      >
        <RequestLeaveDialog />
      </PageHeader>
      <LeaveBalanceCards />
      <section className='flex flex-col gap-3'>
        <h2 className='text-xl font-semibold'>Recent Requests</h2>
        <LeaveHistoryTable />
      </section>
    </>
  );
}
