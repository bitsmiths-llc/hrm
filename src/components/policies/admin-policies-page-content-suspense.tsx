'use client';

import { Suspense } from 'react';

import { AdminPoliciesPageContent } from './admin-policies-page-content';

export function AdminPoliciesPageContentSuspense() {
  return (
    <Suspense fallback={null}>
      <AdminPoliciesPageContent />
    </Suspense>
  );
}
