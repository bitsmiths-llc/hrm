'use client';

import { format } from 'date-fns';
import { CheckCircle2, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAcknowledgePolicy } from '@/hooks/actions/use-acknowledge-policy';
import { usePendingAcknowledgments } from '@/hooks/queries/policies';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

import { ActivePolicy } from '@/types/hrm';

/**
 * The employee's outstanding acknowledgments (PRD §6.3), acknowledgeable in
 * place.
 *
 * The list is derived live — active versions minus the caller's
 * acknowledgments — so publishing a new version (BIT-21) re-raises this prompt
 * on its own, with nothing to reset. That makes it the *pull* counterpart to
 * M3.6's notification bell: the bell says something changed, this says you
 * still owe a signature.
 */
export function ReackPrompt() {
  const { data: pending, isLoading } = usePendingAcknowledgments();
  // One action instance serves every row, so the row being submitted is
  // tracked here — otherwise a single `isPending` would spin all the buttons.
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const { executeAsync } = useAcknowledgePolicy();

  const handleAcknowledge = async (policy: ActivePolicy) => {
    setAcknowledgingId(policy.versionId);
    const result = await executeAsync({ policyVersionId: policy.versionId });
    setAcknowledgingId(null);
    if (result?.data) toast.success(`${policy.title} acknowledged`);
  };

  if (isLoading) return <Skeleton className='h-24 rounded-xl' />;

  if (!pending.length) {
    return (
      <Card>
        <CardContent className='flex items-center gap-3 p-4'>
          <CheckCircle2 className='size-5 shrink-0 text-primary' aria-hidden />
          <p className='text-sm text-muted-foreground'>
            You're all caught up on company policies.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-amber-500/40 bg-amber-500/5'>
      <CardContent className='flex flex-col gap-3 p-4'>
        <div className='flex items-start gap-3'>
          <Megaphone
            className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400'
            aria-hidden
          />
          <p className='text-sm font-medium'>
            {pending.length === 1
              ? '1 policy needs your acknowledgment.'
              : `${pending.length} policies need your acknowledgment.`}{' '}
            <span className='font-normal text-muted-foreground'>
              Read each one, then confirm below.
            </span>
          </p>
        </div>

        <ul className='flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-background'>
          {pending.map((policy) => (
            <li
              key={policy.versionId}
              className='flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex min-w-0 flex-col gap-0.5'>
                <p className='truncate text-sm font-medium'>{policy.title}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {policyCategoryLabels[policy.category]} · Version{' '}
                  {policy.version} · Published{' '}
                  {format(policy.publishedAt, 'MMM d, yyyy')}
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <Link href={paths.employee.policyDetail(policy.id)}>
                  <Button variant='outline' size='sm'>
                    Read
                  </Button>
                </Link>
                <Button
                  size='sm'
                  onClick={() => handleAcknowledge(policy)}
                  isLoading={acknowledgingId === policy.versionId}
                >
                  I acknowledge
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
