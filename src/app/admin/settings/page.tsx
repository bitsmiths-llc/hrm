import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { LeaveSettingsForm } from '@/components/settings/leave-settings-form';
import { MedicalSettingsForm } from '@/components/settings/medical-settings-form';
import { OvertimeSettingsForm } from '@/components/settings/overtime-settings-form';
import { ProjectsSettingsCard } from '@/components/settings/projects-settings-card';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title='Settings'
        description='Module-wide configuration for leave, medical allowance, and payroll.'
      />
      {/* Ordered shortest → tallest so each row pairs cards of similar height:
          the two single-field cards (Leave, Payroll) sit on top, the two taller
          cards (Medical, Overtime Projects) below — keeps side-by-side pairs
          aligned instead of a short card leaving a gap next to a tall one. */}
      <div className='grid max-w-4xl grid-cols-1 items-start gap-6 md:grid-cols-2'>
        <LeaveSettingsForm />
        <OvertimeSettingsForm />
        <MedicalSettingsForm />
        <ProjectsSettingsCard />
      </div>
    </>
  );
}
