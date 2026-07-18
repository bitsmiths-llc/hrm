'use client';

import { useState } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { LogOvertimeDialog } from '@/components/overtime/log-overtime-dialog';

import { currentMonth } from '@/utils/date-functions';

import { OvertimeHistoryTable } from './overtime-history-table';
import { OvertimeSummaryCards } from './overtime-summary-cards';

export function OvertimePageContent() {
  // Default to the current month; the filter can widen to a year or all time.
  const [month, setMonth] = useState(currentMonth());
  const { data: me } = useCurrentEmployee();

  return (
    <>
      <PageHeader
        title='Overtime'
        description='Log extra hours and track their approval status.'
      >
        <MonthFilter value={month} onChange={setMonth} />
        <LogOvertimeDialog />
      </PageHeader>
      <OvertimeSummaryCards employeeId={me?.id} month={month} />
      <OvertimeHistoryTable employeeId={me?.id} month={month} />
    </>
  );
}
