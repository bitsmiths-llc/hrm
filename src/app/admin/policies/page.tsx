import { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminPoliciesPageContent } from '@/components/policies/admin-policies-page-content';

export const metadata: Metadata = { title: 'Policies' };

export default function AdminPoliciesPage() {
  return (
    <Suspense>
      <AdminPoliciesPageContent />
    </Suspense>
  );
}
