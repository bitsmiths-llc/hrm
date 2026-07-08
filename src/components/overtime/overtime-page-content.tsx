'use client';

import { useState } from 'react';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { LogOvertimeDialog } from '@/components/overtime/log-overtime-dialog';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { OvertimeHistoryTable } from './overtime-history-table';
import { OvertimeSummaryCards } from './overtime-summary-cards';

export function OvertimePageContent() {
  const [month, setMonth] = useState('all');

  return (
    <>
      <PageHeader
        title='Overtime'
        description='Log extra hours and track their approval status.'
      >
        <MonthFilter value={month} onChange={setMonth} />
        <LogOvertimeDialog />
      </PageHeader>
      <OvertimeSummaryCards employeeId={mockCurrentEmployee.id} month={month} />
      <OvertimeHistoryTable month={month} />
    </>
  );
}
