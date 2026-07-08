import { Metadata } from 'next';

import { OvertimePageContent } from '@/components/overtime/overtime-page-content';

export const metadata: Metadata = { title: 'Overtime' };

export default function OvertimePage() {
  return <OvertimePageContent />;
}
