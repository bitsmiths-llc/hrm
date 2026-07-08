'use client';

import { useState } from 'react';

import { MonthFilter } from '@/components/hrm/month-filter';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { LeaveBalanceCards } from './leave-balance-cards';
import { LeaveHistoryTable } from './leave-history-table';

export function LeavePageContent() {
  const [month, setMonth] = useState('all');

  return (
    <>
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <LeaveBalanceCards employeeId={mockCurrentEmployee.id} month={month} />
      <LeaveHistoryTable month={month} />
    </>
  );
}
