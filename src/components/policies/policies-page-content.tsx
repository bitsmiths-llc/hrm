'use client';

import { AlertCircle, CheckCircle2, FileText, FileX2 } from 'lucide-react';
import Link from 'next/link';

import {
  currentContractVersion,
  useMyContract,
} from '@/hooks/queries/contracts';
import {
  latestAcknowledgment,
  useActivePolicies,
  useMyPolicyAcknowledgments,
} from '@/hooks/queries/policies';

import { ContractVersionList } from '@/components/employees/contract-version-list';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { Skeleton } from '@/components/ui/skeleton';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

export function PoliciesPageContent() {
  // Employees only ever see the current version of each policy — this reads
  // the active `policy_versions` rows, never the history behind them.
  const { data: policies, isLoading: policiesLoading } = useActivePolicies();
  const { data: acknowledgments, isLoading: acksLoading } =
    useMyPolicyAcknowledgments();
  const { data: contract, isLoading: contractLoading } = useMyContract();
  const isLoading = policiesLoading || acksLoading;

  return (
    <>
      <PageHeader
        title='Policies & Contract'
        description='Company policies, your contract, and acknowledgments.'
      />

      <div className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>My Contract</h2>
        {contractLoading ? (
          <Skeleton className='h-16 rounded-xl' />
        ) : !contract?.versions.length ? (
          <EmptyState
            icon={FileX2}
            title='No contract on file'
            description="Contact admin if you're expecting one."
          />
        ) : (
          <ContractVersionList versions={[currentContractVersion(contract)]} />
        )}
      </div>

      <h2 className='text-lg font-semibold'>Policies</h2>
      {isLoading ? (
        <Skeleton className='h-64 rounded-xl' />
      ) : !policies?.length ? (
        <EmptyState
          icon={FileText}
          title='No policies yet'
          description='Company policies will show up here once published.'
        />
      ) : (
        <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
          {policies.map((policy) => {
            const ack = latestAcknowledgment(acknowledgments ?? [], policy.id);
            const upToDate = !!ack && ack.acknowledgedVersion >= policy.version;

            return (
              <li key={policy.id}>
                <Link
                  href={paths.employee.policyDetail(policy.id)}
                  className='flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground'
                >
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <p className='truncate text-sm font-medium'>
                      {policy.title}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {policyCategoryLabels[policy.category]} · Version{' '}
                      {policy.version}
                    </p>
                  </div>
                  {upToDate ? (
                    <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <CheckCircle2
                        className='size-4 text-primary'
                        aria-hidden
                      />
                      Acknowledged
                    </span>
                  ) : (
                    <span className='flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
                      <AlertCircle className='size-4' aria-hidden />
                      Needs acknowledgment
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
