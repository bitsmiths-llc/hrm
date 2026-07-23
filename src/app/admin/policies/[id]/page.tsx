import { Metadata } from 'next';

import { PolicyEditorPageContent } from '@/components/policies/policy-editor-page-content';

export const metadata: Metadata = { title: 'Edit Policy' };

export default async function AdminPolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PolicyEditorPageContent policyId={id} />;
}
