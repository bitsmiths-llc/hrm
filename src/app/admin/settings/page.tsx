import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <ComingSoon
      title='Settings'
      description='Overtime multiplier, medical accrual, leave pool, email template, and module toggles.'
    />
  );
}
