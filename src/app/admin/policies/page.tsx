import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Policies & Contracts' };

export default function AdminPoliciesPage() {
  return (
    <ComingSoon
      title='Policies & Contracts'
      description='Manage policy documents, versions, contracts, and acknowledgment compliance.'
    />
  );
}
