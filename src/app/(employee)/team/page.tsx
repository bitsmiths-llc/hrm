import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { TeamDirectory } from '@/components/team/team-directory';

export const metadata: Metadata = { title: 'Team' };

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title='Team'
        description='Everyone at Bitsmiths. Copy a colleague’s email or GitHub whenever you need it.'
      />
      <TeamDirectory />
    </>
  );
}
