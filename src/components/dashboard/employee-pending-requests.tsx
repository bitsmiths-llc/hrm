'use client';

import { Inbox } from 'lucide-react';

import { useCurrentEmployee } from '@/hooks/queries/employees';
import { useLeaveRequests } from '@/hooks/queries/leave';

import { EmptyState } from '@/components/hrm/empty-state';
import { StatusBadge } from '@/components/hrm/status-badge';
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
import { mockCurrentEmployee } from '@/constants/mock/employees';
import { mockMedicalClaims, mockOvertimeLogs } from '@/constants/mock/requests';

export function EmployeePendingRequests() {
  // Leave is real (BIT-12), scoped to the signed-in employee; medical/overtime
  // are still mock (keyed by the mock employee).
  const { data: me } = useCurrentEmployee();
  const { data: leaveRequests } = useLeaveRequests(me?.id);
  const mockEmployeeId = mockCurrentEmployee.id;

  const rows = [
    ...(leaveRequests ?? [])
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        id: r.id,
        title: leaveTypeLabels[r.type],
        detail: `${r.days} day(s) from ${formatDate(r.startDate)}`,
        status: r.status,
      })),
    ...mockMedicalClaims
      .filter((c) => c.employeeId === mockEmployeeId && c.status === 'pending')
      .map((c) => ({
        id: c.id,
        title: 'Medical Claim',
        detail: `${formatCurrency(c.amount)} · ${formatDate(c.expenseDate)}`,
        status: c.status,
      })),
    ...mockOvertimeLogs
      .filter((o) => o.employeeId === mockEmployeeId && o.status === 'pending')
      .map((o) => ({
        id: o.id,
        title: 'Overtime',
        detail: `${o.hours}h on ${formatDate(o.date)} · ${o.project}`,
        status: o.status,
      })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>
          Pending Requests
        </CardTitle>
        <CardDescription>
          Submitted requests awaiting admin review
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title='Nothing pending'
            description='All your requests have been reviewed.'
          />
        ) : (
          <ul className='flex flex-col divide-y divide-border'>
            {rows.map((row) => (
              <li
                key={row.id}
                className='flex items-center justify-between gap-4 py-3'
              >
                <div className='flex flex-col gap-0.5'>
                  <p className='text-sm font-medium'>{row.title}</p>
                  <p className='text-xs text-muted-foreground'>{row.detail}</p>
                </div>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
