'use client';

import { useState } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';
import { useHrmSettings } from '@/hooks/queries/settings';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { RequestLeaveDialog } from '@/components/leave/request-leave-dialog';

import { LeaveBalanceCards } from './leave-balance-cards';
import { LeaveHistoryTable } from './leave-history-table';

export function LeavePageContent() {
  const [month, setMonth] = useState('all');
  const { data: settings } = useHrmSettings();
  const { data: me } = useCurrentEmployee();

  return (
    <>
      <PageHeader
        title='Leave'
        description={`Request leave and track your ${settings?.leavePoolDays ?? '…'}-day annual pool.`}
      >
        <MonthFilter value={month} onChange={setMonth} />
        <RequestLeaveDialog />
      </PageHeader>
      <LeaveBalanceCards employeeId={me?.id} month={month} />
      <LeaveHistoryTable month={month} />
    </>
  );
}
