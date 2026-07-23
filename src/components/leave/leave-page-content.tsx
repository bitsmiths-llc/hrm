'use client';

import { useState } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';
import { useLeaveBalance } from '@/hooks/queries/leave';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { RequestLeaveDialog } from '@/components/leave/request-leave-dialog';

import { currentYear } from '@/utils/date-functions';

import { LeaveBalanceCards } from './leave-balance-cards';
import { LeaveHistoryTable } from './leave-history-table';

export function LeavePageContent() {
  // Default to the current year (the pool resets annually); users can widen to
  // all time or narrow to a month via the filter.
  const [month, setMonth] = useState(currentYear());
  const { data: me } = useCurrentEmployee();
  // Show the employee's resolved pool (their override, else the global) so the
  // header agrees with the balance cards below rather than the global setting.
  const { data: balance } = useLeaveBalance(me?.id);

  return (
    <>
      <PageHeader
        title='Leave'
        description={`Request leave and track your ${balance?.poolTotal ?? '…'}-day annual pool.`}
      >
        <MonthFilter value={month} onChange={setMonth} />
        <RequestLeaveDialog />
      </PageHeader>
      <LeaveBalanceCards employeeId={me?.id} month={month} />
      <LeaveHistoryTable employeeId={me?.id} month={month} />
    </>
  );
}
