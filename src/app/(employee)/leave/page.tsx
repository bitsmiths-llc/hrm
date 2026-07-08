import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { LeavePageContent } from '@/components/leave/leave-page-content';
import { RequestLeaveDialog } from '@/components/leave/request-leave-dialog';

export const metadata: Metadata = { title: 'Leave' };

export default function LeavePage() {
  return (
    <>
      <PageHeader
        title='Leave'
        description='Request leave and track your 22-day annual pool.'
      >
        <RequestLeaveDialog />
      </PageHeader>
      <LeavePageContent />
    </>
  );
}
