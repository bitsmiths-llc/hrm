import { Metadata } from 'next';

import { PolicyDetailPageContent } from '@/components/policies/policy-detail-page-content';

export const metadata: Metadata = { title: 'Policy' };

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PolicyDetailPageContent policyId={id} />;
}
