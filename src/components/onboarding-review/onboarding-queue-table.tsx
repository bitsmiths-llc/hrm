'use client';

import { UserCheck } from 'lucide-react';

import { useOnboardingQueue } from '@/hooks/queries/employees';

import { PendingQueueTable } from '@/components/ui/data-table/pending-queue-table';

import { useOnboardingQueueColumns } from './onboarding-queue-columns';

/** The admin onboarding review queue — `submitted` employees awaiting a
 *  decision, rendered through the generic PendingQueueTable shell. */
export function OnboardingQueueTable() {
  const { data: employees, isLoading } = useOnboardingQueue();
  const columns = useOnboardingQueueColumns();

  return (
    <PendingQueueTable
      data={employees}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder='Search by name or email…'
      emptyState={{
        icon: UserCheck,
        title: 'No submissions to review',
        description:
          'When an employee finishes onboarding, their submission shows up here for approval.',
      }}
    />
  );
}
