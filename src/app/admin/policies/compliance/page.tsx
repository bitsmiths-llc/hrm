import { Metadata } from 'next';

import { PolicyCompliancePageContent } from '@/components/policies/policy-compliance-page-content';

export const metadata: Metadata = { title: 'Policy Compliance' };

export default function PolicyCompliancePage() {
  return <PolicyCompliancePageContent />;
}
