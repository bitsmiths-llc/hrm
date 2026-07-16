'use client';

import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { DetailSheet } from '@/components/hrm/detail-sheet';
import { EmptyState } from '@/components/hrm/empty-state';
import { StatusBadge } from '@/components/hrm/status-badge';
import { ProofFilesList } from '@/components/medical/proof-files-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  type ApprovalItem,
  type ApprovalKind,
  approvalKindLabels,
  leaveToItem,
  medicalToItem,
  overtimeToItem,
} from './approval-items';
import { LeaveReviewActions } from './leave-review-actions';
import { MedicalReviewActions } from './medical-review-actions';
import { OvertimeReviewActions } from './overtime-review-actions';

export function ApprovalsQueue() {
  const leave = useAllLeaveRequests();
  const medical = useAllMedicalClaims();
  const overtime = useAllOvertimeLogs();

  const [tab, setTab] = useState<'all' | ApprovalKind>('all');
  const [selected, setSelected] = useState<ApprovalItem | null>(null);

  const isLoading = leave.isLoading || medical.isLoading || overtime.isLoading;

  const pending = useMemo(() => {
    const all: ApprovalItem[] = [
      ...(leave.data ?? []).map(leaveToItem),
      ...(medical.data ?? []).map(medicalToItem),
      ...(overtime.data ?? []).map(overtimeToItem),
    ];
    return all
      .filter((item) => item.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [leave.data, medical.data, overtime.data]);

  const visible =
    tab === 'all' ? pending : pending.filter((item) => item.kind === tab);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-9 w-72 rounded-lg' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value='all'>All ({pending.length})</TabsTrigger>
          {(Object.keys(approvalKindLabels) as ApprovalKind[]).map((kind) => (
            <TabsTrigger key={kind} value={kind}>
              {approvalKindLabels[kind]} (
              {pending.filter((i) => i.kind === kind).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title='Queue is clear'
          description='Nothing waiting for your approval in this category.'
        />
      ) : (
        <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
          {visible.map((item) => (
            <li
              key={item.id}
              className='flex flex-wrap items-center justify-between gap-3 px-4 py-3'
            >
              <div className='flex min-w-0 flex-col gap-0.5'>
                <div className='flex items-center gap-2'>
                  <p className='truncate text-sm font-medium'>
                    {item.employeeName}
                    <span className='text-muted-foreground'>
                      {' '}
                      · {item.title}
                    </span>
                  </p>
                  <Badge variant='outline' className='shrink-0'>
                    {approvalKindLabels[item.kind]}
                  </Badge>
                </div>
                <p className='truncate text-xs text-muted-foreground'>
                  {item.summary}
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelected(item)}
              >
                Review
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!!selected && (
        <DetailSheet
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
          title={selected.title}
          description={`Requested by ${selected.employeeName}`}
          fields={[
            ...selected.fields,
            {
              label: 'Status',
              value: <StatusBadge status={selected.status} />,
            },
          ]}
          footer={
            selected.kind === 'leave' ? (
              // Leave is backed by the real reviewLeaveRequest action (required
              // reason on reject + employee email); its invalidation refreshes
              // the queue.
              <LeaveReviewActions
                itemId={selected.id}
                employeeName={selected.employeeName}
                onReviewed={() => setSelected(null)}
              />
            ) : selected.kind === 'medical' ? (
              // Medical is backed by the real reviewMedicalClaim action
              // (server-side balance bound on approve, required reason + email
              // on reject); its invalidation refreshes the queue.
              <MedicalReviewActions
                itemId={selected.id}
                employeeName={selected.employeeName}
                onReviewed={() => setSelected(null)}
              />
            ) : (
              // Overtime is backed by the real reviewOvertimeLog action (required
              // reason on reject + employee email); its invalidation refreshes
              // the queue.
              <OvertimeReviewActions
                itemId={selected.id}
                employeeName={selected.employeeName}
                onReviewed={() => setSelected(null)}
              />
            )
          }
        >
          {selected.kind === 'medical' && (
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Proof files
              </p>
              <ProofFilesList files={selected.proofFiles ?? []} />
            </div>
          )}
        </DetailSheet>
      )}
    </div>
  );
}
