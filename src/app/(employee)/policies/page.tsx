import { Metadata } from 'next';

import { PoliciesPageContent } from '@/components/policies/policies-page-content';

export const metadata: Metadata = { title: 'Policies & Contract' };

export default function PoliciesPage() {
  return <PoliciesPageContent />;
}
