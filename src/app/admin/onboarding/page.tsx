import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { OnboardingQueueTable } from '@/components/onboarding-review/onboarding-queue-table';

export const metadata: Metadata = { title: 'Onboarding queue' };

export default function OnboardingQueuePage() {
  return (
    <>
      <PageHeader
        title='Onboarding queue'
        description='Review submitted onboarding and approve or return each one.'
      />
      <OnboardingQueueTable />
    </>
  );
}
