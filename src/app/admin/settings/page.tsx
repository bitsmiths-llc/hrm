import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { LeaveSettingsForm } from '@/components/settings/leave-settings-form';
import { MedicalSettingsForm } from '@/components/settings/medical-settings-form';
import { OvertimeSettingsForm } from '@/components/settings/overtime-settings-form';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title='Settings'
        description='Module-wide configuration for leave, medical allowance, and payroll.'
      />
      <div className='flex flex-wrap gap-6'>
        <LeaveSettingsForm />
        <MedicalSettingsForm />
        <OvertimeSettingsForm />
      </div>
    </>
  );
}
