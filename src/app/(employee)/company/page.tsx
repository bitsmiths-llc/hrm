import { Metadata } from 'next';

import { CompanyPageContent } from '@/components/company/company-page-content';
import { PageHeader } from '@/components/hrm/page-header';

export const metadata: Metadata = { title: 'Company' };

export default function CompanyPage() {
  return (
    <>
      <PageHeader
        title='Company'
        description='Meet the team and see what everyone’s working on. Copy a colleague’s email or GitHub whenever you need it.'
      />
      <CompanyPageContent />
    </>
  );
}
