'use client';

import { Inbox } from 'lucide-react';
import Link from 'next/link';

import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { EmptyState } from '@/components/hrm/empty-state';
import { StatusBadge } from '@/components/hrm/status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { formatDate } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import { leaveTypeLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

export function AdminPendingQueue() {
  const { data: leaveRequests } = useAllLeaveRequests();
  const { data: medicalClaims } = useAllMedicalClaims();
  const { data: overtimeLogs } = useAllOvertimeLogs();
  const rows = [
    ...(leaveRequests ?? [])
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        id: r.id,
        who: r.employeeName,
        what: leaveTypeLabels[r.type],
        detail: `${r.days} day(s) from ${formatDate(r.startDate)}`,
        createdAt: r.createdAt,
      })),
    ...(medicalClaims ?? [])
      .filter((c) => c.status === 'pending')
      .map((c) => ({
        id: c.id,
        who: c.employeeName,
        what: 'Medical claim',
        detail: formatCurrency(c.amount),
        createdAt: c.createdAt,
      })),
    ...(overtimeLogs ?? [])
      .filter((o) => o.status === 'pending')
      .map((o) => ({
        id: o.id,
        who: o.employeeName,
        what: 'Overtime',
        detail: `${o.hours}h · ${o.project}`,
        createdAt: o.createdAt,
      })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Card>
      <CardHeader className='flex-row items-start justify-between space-y-0'>
        <div className='flex flex-col gap-1.5'>
          <CardTitle className='text-xl font-semibold'>
            Approvals Queue
          </CardTitle>
          <CardDescription>
            Everything waiting on admin action, latest first
          </CardDescription>
        </div>
        <Link href={paths.admin.approvals}>
          <Button size='sm' variant='outline'>
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title='Queue is clear'
            description='No pending requests right now.'
          />
        ) : (
          <ul className='flex flex-col divide-y divide-border'>
            {rows.map((row) => (
              <li
                key={row.id}
                className='flex items-center justify-between gap-4 py-3'
              >
                <div className='flex flex-col gap-0.5'>
                  <p className='text-sm font-medium'>
                    {row.who}
                    <span className='text-muted-foreground'> · {row.what}</span>
                  </p>
                  <p className='text-xs text-muted-foreground'>{row.detail}</p>
                </div>
                <StatusBadge status='pending' />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
