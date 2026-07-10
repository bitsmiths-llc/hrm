import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Leave' };

export default function LeavePage() {
  return (
    <ComingSoon
      title='Leave'
      description='Request leave, track your 22-day pool, and view your history.'
    />
  );
}
