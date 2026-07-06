import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Policies & Contract' };

export default function PoliciesPage() {
  return (
    <ComingSoon
      title='Policies & Contract'
      description='Company policies, your contract, and acknowledgments.'
    />
  );
}
