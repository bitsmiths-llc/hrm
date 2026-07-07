'use client';

import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { DetailSheet } from '@/components/hrm/detail-sheet';
import { EmptyState } from '@/components/hrm/empty-state';
import { StatusBadge } from '@/components/hrm/status-badge';
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

type Decision = 'approved' | 'rejected';

export function ApprovalsQueue() {
  const leave = useAllLeaveRequests();
  const medical = useAllMedicalClaims();
  const overtime = useAllOvertimeLogs();

  const [tab, setTab] = useState<'all' | ApprovalKind>('all');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [selected, setSelected] = useState<ApprovalItem | null>(null);

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
                <Badge variant='outline'>{approvalKindLabels[item.kind]}</Badge>
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
          }
        />
      )}
    </div>
  );
}
