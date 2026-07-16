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
      {/* Two independent stacked columns (masonry-style) so cards pack tightly
          top-to-bottom within each column — a short card never leaves a gap
          beside a taller neighbour the way an aligned grid row does. Payroll and
          Medical (the two-field cards) anchor a column each; Leave and Projects
          fill the remaining space beneath them. */}
      <div className='grid max-w-4xl grid-cols-1 items-start gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-6'>
          <OvertimeSettingsForm />
          <LeaveSettingsForm />
        </div>
        <div className='flex flex-col gap-6'>
          <MedicalSettingsForm />
          <ProjectsSettingsCard />
        </div>
      </div>
    </>
  );
}
