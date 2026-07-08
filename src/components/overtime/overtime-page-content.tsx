'use client';

import { useState } from 'react';

import { MonthFilter } from '@/components/hrm/month-filter';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { OvertimeHistoryTable } from './overtime-history-table';
import { OvertimeSummaryCards } from './overtime-summary-cards';

export function OvertimePageContent() {
  const [month, setMonth] = useState('all');

  return (
    <>
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <OvertimeSummaryCards employeeId={mockCurrentEmployee.id} month={month} />
      <OvertimeHistoryTable month={month} />
    </>
  );
}
