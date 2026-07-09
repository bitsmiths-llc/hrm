import { Metadata } from 'next';

import { AdminPoliciesPageContent } from '@/components/policies/admin-policies-page-content';

export const metadata: Metadata = { title: 'Policies & Contracts' };

export default function AdminPoliciesPage() {
  return <AdminPoliciesPageContent />;
}
