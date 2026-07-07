'use client';

import { useMyLeaveRequests } from '@/hooks/queries/leave';

import { LeaveRequestsTable } from './leave-requests-table';

export function LeaveHistoryTable() {
  const { data: requests, isLoading } = useMyLeaveRequests();

  return (
    <LeaveRequestsTable
      requests={requests}
      isLoading={isLoading}
      emptyDescription='Your requests and their status will show up here.'
      title='Recent Requests'
    />
  );
}
