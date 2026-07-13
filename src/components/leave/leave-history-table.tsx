'use client';

import { useLeaveRequests } from '@/hooks/queries/leave';

import { LeaveRequestsTable } from './leave-requests-table';

type LeaveHistoryTableProps = {
  /** The signed-in employee's id. Undefined until the identity resolves — the
   *  table shows a skeleton until then. Sharing this id-keyed query with the
   *  balance widget means the page fetches the rows once. */
  employeeId?: string;
  month: string;
};

export function LeaveHistoryTable({
  employeeId,
  month,
}: LeaveHistoryTableProps) {
  const { data: requests, isLoading } = useLeaveRequests(employeeId);

  return (
    <LeaveRequestsTable
      requests={requests}
      isLoading={isLoading || !employeeId}
      emptyDescription='Your requests and their status will show up here.'
      title='Recent Requests'
      month={month}
    />
  );
}
