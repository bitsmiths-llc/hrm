import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { OvertimeSettingsForm } from '@/components/settings/overtime-settings-form';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title='Settings'
        description='Module-wide configuration for payroll runs.'
      />
      <OvertimeSettingsForm />
    </>
  );
}
