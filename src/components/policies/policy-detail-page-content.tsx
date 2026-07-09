'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, FileX2, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  currentVersion,
  useMyPolicyAcknowledgments,
  usePolicy,
} from '@/hooks/queries/policies';

import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { highlightChangedBlocks } from '@/lib/policy-diff';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { mockCurrentEmployee } from '@/constants/mock/employees';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import { PolicyContent } from './policy-content';

import { PolicyAcknowledgment } from '@/types/hrm';

type PolicyDetailPageContentProps = {
  policyId: string;
};

export function PolicyDetailPageContent({
  policyId,
}: PolicyDetailPageContentProps) {
  const queryClient = useQueryClient();
  const { data: policy, isLoading: policyLoading } = usePolicy(policyId);
  const { data: acknowledgments, isLoading: acksLoading } =
    useMyPolicyAcknowledgments();

  if (policyLoading || acksLoading)
    return <Skeleton className='h-96 rounded-xl' />;

  if (!policy) {
    return (
      <EmptyState
        icon={FileX2}
        title='Policy not found'
        description='This policy may have been removed.'
      />
    );
  }

  const latest = currentVersion(policy);
  const ack = acknowledgments?.find((a) => a.policyId === policy.id);
  const upToDate = !!ack && ack.acknowledgedVersion >= latest.version;

  // Diffed against whatever version the employee last acknowledged (not
  // necessarily the immediately-previous one, if they skipped an update),
  // so the highlighting always reflects everything new to them.
  const previousAckedVersion = ack
    ? policy.versions.find((v) => v.version === ack.acknowledgedVersion)
    : undefined;
  const displayHtml =
    !upToDate && previousAckedVersion
      ? highlightChangedBlocks(
          previousAckedVersion.contentHtml,
          latest.contentHtml,
        )
      : latest.contentHtml;

  const handleAcknowledge = () => {
    queryClient.setQueryData<PolicyAcknowledgment[]>(
      [QueryKeys.POLICY_ACKNOWLEDGMENTS],
      (old) => {
        const withoutThis = (old ?? []).filter(
          (a) =>
            !(
              a.policyId === policy.id &&
              a.employeeId === mockCurrentEmployee.id
            ),
        );
        return [
          ...withoutThis,
          {
            policyId: policy.id,
            employeeId: mockCurrentEmployee.id,
            acknowledgedVersion: latest.version,
            acknowledgedAt: new Date().toISOString().slice(0, 10),
          },
        ];
      },
    );
    toast.success(`${policy.title} acknowledged`);
  };

  return (
    <>
      <div>
        <Link href={paths.employee.policies}>
          <Button variant='ghost' size='sm' iconLeft={ArrowLeft}>
            Back to Policies
          </Button>
        </Link>
      </div>

      <PageHeader
        title={policy.title}
        description={`${policyCategoryLabels[policy.category]} · Version ${latest.version}`}
      />

      {!upToDate && (
        <Card className='border-amber-500/40 bg-amber-500/5'>
          <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3'>
              <Megaphone
                className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400'
                aria-hidden
              />
              <div className='flex flex-col gap-0.5'>
                <p className='text-sm font-medium'>
                  {ack
                    ? `This policy was updated on ${format(latest.publishedAt, 'MMM d, yyyy')}. Changes are highlighted below — read and acknowledge.`
                    : 'Please review and acknowledge this policy'}
                </p>
              </div>
            </div>
            <Button onClick={handleAcknowledge} className='shrink-0'>
              I've read and acknowledge this
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className='p-6'>
          <PolicyContent html={displayHtml} />
        </CardContent>
      </Card>

      {upToDate && !!ack && (
        <p className='text-xs text-muted-foreground'>
          Acknowledged on {format(ack.acknowledgedAt, 'MMM d, yyyy')}
        </p>
      )}
    </>
  );
}
