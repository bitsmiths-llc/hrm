import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Onboarding' };

export default function OnboardingPage() {
  return (
    <ComingSoon
      title='Onboarding'
      description='Complete your profile, documents, and consent to become active.'
    />
  );
}
