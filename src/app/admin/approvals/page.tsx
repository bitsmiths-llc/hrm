import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Approvals' };

export default function ApprovalsPage() {
  return (
    <ComingSoon
      title='Approvals'
      description='Unified queue for leave, medical, overtime, and onboarding reviews.'
    />
  );
}
