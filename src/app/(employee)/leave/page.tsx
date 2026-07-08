import { Metadata } from 'next';

import { LeavePageContent } from '@/components/leave/leave-page-content';

export const metadata: Metadata = { title: 'Leave' };

export default function LeavePage() {
  return <LeavePageContent />;
}
