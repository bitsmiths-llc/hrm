'use client';

import { useState } from 'react';

import { useHrmSettings } from '@/hooks/queries/settings';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { RequestLeaveDialog } from '@/components/leave/request-leave-dialog';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { LeaveBalanceCards } from './leave-balance-cards';
import { LeaveHistoryTable } from './leave-history-table';

export function LeavePageContent() {
  const [month, setMonth] = useState('all');
  const { data: settings } = useHrmSettings();

  return (
    <>
      <PageHeader
        title='Leave'
        description={`Request leave and track your ${settings?.leavePoolDays ?? '…'}-day annual pool.`}
      >
        <MonthFilter value={month} onChange={setMonth} />
        <RequestLeaveDialog />
      </PageHeader>
      <LeaveBalanceCards employeeId={mockCurrentEmployee.id} month={month} />
      <LeaveHistoryTable month={month} />
    </>
  );
}
