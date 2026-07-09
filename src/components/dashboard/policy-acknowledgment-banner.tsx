'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';

import {
  currentVersion,
  useMyPolicyAcknowledgments,
  usePolicies,
} from '@/hooks/queries/policies';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { paths } from '@/constants/paths';

export function PolicyAcknowledgmentBanner() {
  const { data: policies } = usePolicies();
  const { data: acknowledgments } = useMyPolicyAcknowledgments();

  if (!policies?.length) return null;

  const unacknowledged = policies.filter((policy) => {
    const latest = currentVersion(policy);
    const ack = acknowledgments?.find((a) => a.policyId === policy.id);
    return !ack || ack.acknowledgedVersion < latest.version;
  });

  if (unacknowledged.length === 0) return null;

  return (
    <Card>
      <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <FileText className='size-5 text-primary' aria-hidden />
          <p className='text-sm'>
            {unacknowledged.length} updated{' '}
            {unacknowledged.length === 1 ? 'policy needs' : 'policies need'}{' '}
            your acknowledgment.
          </p>
        </div>
        <Link href={paths.employee.policies}>
          <Button size='sm' variant='outline'>
            Review policies
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
