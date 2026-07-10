import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Overtime' };

export default function OvertimePage() {
  return (
    <ComingSoon
      title='Overtime'
      description='Log extra hours and track their approval status.'
    />
  );
}
