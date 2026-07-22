import { Metadata } from 'next';

import { CompanyProjects } from '@/components/company/company-projects';
import { PageHeader } from '@/components/hrm/page-header';
import { TeamDirectory } from '@/components/team/team-directory';

export const metadata: Metadata = { title: 'Company' };

export default function CompanyPage() {
  return (
    <>
      <PageHeader
        title='Company'
        description='Meet the team and see what everyone’s working on. Copy a colleague’s email or GitHub whenever you need it.'
      />

      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold tracking-tight'>Team</h2>
        <TeamDirectory />
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold tracking-tight'>Projects</h2>
        <CompanyProjects />
      </section>
    </>
  );
}
