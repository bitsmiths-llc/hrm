import { Clock } from 'lucide-react';
import { Metadata } from 'next';

import { EmptyState } from '@/components/hrm/empty-state';

export const metadata: Metadata = { title: 'Under review' };

/** Holding page for a `submitted` employee: onboarding is complete and waiting
 *  on an admin's approval. The middleware funnel keeps them here until an admin
 *  approves (→ active, full app) or returns the submission (→ onboarding). */
export default function PendingPage() {
  return (
    <EmptyState
      icon={Clock}
      title='Your onboarding is under review'
      description="Thanks for completing onboarding. An admin is reviewing your details — you'll get full access as soon as it's approved. If anything needs changing, they'll send it back with a note."
    />
  );
}
