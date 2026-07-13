'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useReviewLeave } from '@/hooks/actions/use-review-leave';
import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { DetailSheet } from '@/components/hrm/detail-sheet';
import { EmptyState } from '@/components/hrm/empty-state';
import { RejectRequestDialog } from '@/components/hrm/reject-request-dialog';
import { StatusBadge } from '@/components/hrm/status-badge';
import { ProofFilesList } from '@/components/medical/proof-files-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { QueryKeys } from '@/constants/query-keys';

import {
  type ApprovalItem,
  type ApprovalKind,
  approvalKindLabels,
  leaveToItem,
  medicalToItem,
  overtimeToItem,
} from './approval-items';
import { LeaveReviewActions } from './leave-review-actions';

import { RequestStatus } from '@/types/hrm';

type Decision = 'approved' | 'rejected';

/** Just the fields every rejectable record shares — enough to update status
 *  and reason without needing a kind-specific type per query key family. */
type RejectableRecord = {
  id: string;
  status: RequestStatus;
  rejectionReason: string | null;
};

const queryKeyByKind: Record<ApprovalKind, QueryKeys> = {
  leave: QueryKeys.LEAVE_REQUESTS,
  medical: QueryKeys.MEDICAL_CLAIMS,
  overtime: QueryKeys.OVERTIME_LOGS,
};

export function ApprovalsQueue() {
  const queryClient = useQueryClient();
  const leave = useAllLeaveRequests();
  const medical = useAllMedicalClaims();
  const overtime = useAllOvertimeLogs();

  const [tab, setTab] = useState<'all' | ApprovalKind>('all');
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  // Leave rows currently being quick-approved. A Set (not a single id) keeps the
  // spinner scoped correctly when several are approved concurrently — the single
  // mutation hook drives them all.
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const reviewLeave = useReviewLeave();

  const isLoading = leave.isLoading || medical.isLoading || overtime.isLoading;

  const pending = useMemo(() => {
    const all: ApprovalItem[] = [
      ...(leave.data ?? []).map(leaveToItem),
      ...(medical.data ?? []).map(medicalToItem),
      ...(overtime.data ?? []).map(overtimeToItem),
    ];
    return all
      .filter((item) => item.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [leave.data, medical.data, overtime.data]);

  const visible =
    tab === 'all' ? pending : pending.filter((item) => item.kind === tab);

  // Medical/overtime are still mock: a decision is an optimistic cache write.
  // Partial-key match updates the admin's all-records cache entry and each
  // employee's per-employee entry in one pass. Leave is NOT handled here — it's
  // backed by the real reviewLeaveRequest action, whose invalidation refreshes
  // the queue (see approveLeave / LeaveReviewActions).
  const decide = (item: ApprovalItem, decision: Decision, reason?: string) => {
    queryClient.setQueriesData<RejectableRecord[]>(
      { queryKey: [queryKeyByKind[item.kind]] },
      (old) =>
        old?.map((record) =>
          record.id === item.id
            ? {
                ...record,
                status: decision,
                rejectionReason:
                  decision === 'rejected' ? (reason ?? null) : null,
              }
            : record,
        ),
    );
    setSelected(null);
    toast.success(
      `${item.title} from ${item.employeeName} ${decision === 'approved' ? 'approved' : 'rejected'}`,
    );
  };

  // Quick-approve straight from the row (leave only — the one kind backed by
  // the real reviewLeaveRequest action). Its invalidation drops the row from
  // the queue. Rejection still goes through Review so the admin gives a reason.
  const approveLeave = async (item: ApprovalItem) => {
    setApprovingIds((prev) => new Set(prev).add(item.id));
    const result = await reviewLeave.executeAsync({
      id: item.id,
      decision: 'approved',
    });
    setApprovingIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    if (result?.data) {
      toast.success(`Leave for ${item.employeeName} approved`);
    }
  };

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
              <div className='flex items-center gap-2'>
                {item.kind === 'leave' && (
                  <Button
                    size='sm'
                    isLoading={approvingIds.has(item.id)}
                    onClick={() => approveLeave(item)}
                  >
                    Approve Leave
                  </Button>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelected(item)}
                >
                  Review
                </Button>
              </div>
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
            ) : (
              <div className='flex w-full gap-2'>
                <RejectRequestDialog
                  trigger={
                    <Button variant='destructive' className='flex-1'>
                      Reject
                    </Button>
                  }
                  title={`Reject this ${approvalKindLabels[selected.kind].toLowerCase()} request?`}
                  description={`${selected.employeeName} will see the request as rejected, along with your reason.`}
                  onConfirm={(reason) => decide(selected, 'rejected', reason)}
                />
                <Button
                  className='flex-1'
                  onClick={() => decide(selected, 'approved')}
                >
                  Approve
                </Button>
              </div>
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
