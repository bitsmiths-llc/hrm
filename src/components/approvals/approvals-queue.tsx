'use client';

import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useReviewLeave } from '@/hooks/actions/use-review-leave';
import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
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

type Decision = 'approved' | 'rejected';

export function ApprovalsQueue() {
  const leave = useAllLeaveRequests();
  const medical = useAllMedicalClaims();
  const overtime = useAllOvertimeLogs();

  const [tab, setTab] = useState<'all' | ApprovalKind>('all');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  // Which leave row is currently being quick-approved (scopes the button's
  // loading state to that row — a single mutation hook drives them all).
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const reviewLeave = useReviewLeave();

  const isLoading = leave.isLoading || medical.isLoading || overtime.isLoading;

  const pending = useMemo(() => {
    const all: ApprovalItem[] = [
      ...(leave.data ?? []).map(leaveToItem),
      ...(medical.data ?? []).map(medicalToItem),
      ...(overtime.data ?? []).map(overtimeToItem),
    ];
    return all
      .filter((item) => item.status === 'pending' && !decisions[item.id])
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [leave.data, medical.data, overtime.data, decisions]);

  const visible =
    tab === 'all' ? pending : pending.filter((item) => item.kind === tab);

  const decide = (item: ApprovalItem, decision: Decision) => {
    setDecisions((prev) => ({ ...prev, [item.id]: decision }));
    setSelected(null);
    toast.success(
      `${item.title} from ${item.employeeName} ${decision === 'approved' ? 'approved' : 'rejected'}`,
    );
  };

  // Quick-approve straight from the row (leave only — it's the one kind backed
  // by the real reviewLeaveRequest action). Rejection still goes through Review
  // so the admin can supply the required reason.
  const approveLeave = async (item: ApprovalItem) => {
    setApprovingId(item.id);
    const result = await reviewLeave.executeAsync({
      id: item.id,
      decision: 'approved',
    });
    setApprovingId(null);
    if (result?.data) {
      setDecisions((prev) => ({ ...prev, [item.id]: 'approved' }));
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
                <p className='truncate text-sm font-medium'>
                  {item.employeeName}
                  <span className='text-muted-foreground'> · {item.title}</span>
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {item.summary}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                {item.kind === 'leave' ? (
                  <Button
                    size='sm'
                    isLoading={approvingId === item.id}
                    onClick={() => approveLeave(item)}
                  >
                    Approve Leave
                  </Button>
                ) : (
                  <Badge variant='outline'>
                    {approvalKindLabels[item.kind]}
                  </Badge>
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
              // Leave is backed by the real `reviewLeaveRequest` action (with a
              // required reason on reject + employee email). Medical/overtime
              // are still mock and use the local-state `decide` below.
              <LeaveReviewActions
                itemId={selected.id}
                employeeName={selected.employeeName}
                onReviewed={(decision) => {
                  setDecisions((prev) => ({
                    ...prev,
                    [selected.id]: decision,
                  }));
                  setSelected(null);
                }}
              />
            ) : (
              <div className='flex w-full gap-2'>
                <ConfirmDialog
                  trigger={
                    <Button variant='destructive' className='flex-1'>
                      Reject
                    </Button>
                  }
                  title={`Reject this ${approvalKindLabels[selected.kind].toLowerCase()} request?`}
                  description={`${selected.employeeName} will see the request as rejected.`}
                  confirmLabel='Reject request'
                  destructive
                  onConfirm={() => decide(selected, 'rejected')}
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
