import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export const metadata: Metadata = { title: 'Onboarding' };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title='Onboarding'
        description='Complete the five sections below to activate your account.'
      />
      <OnboardingWizard />
    </>
  );
}
