import { Metadata } from 'next';

import { AdminPoliciesPageContentSuspense } from '@/components/policies/admin-policies-page-content-suspense';

export const metadata: Metadata = { title: 'Policies' };

export default function AdminPoliciesPage() {
  return <AdminPoliciesPageContentSuspense />;
}
