'use client';

import { useState } from 'react';

import { MonthFilter } from '@/components/hrm/month-filter';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { MedicalBalanceCards } from './medical-balance-cards';
import { MedicalHistoryTable } from './medical-history-table';

export function MedicalPageContent() {
  const [month, setMonth] = useState('all');

  return (
    <>
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <MedicalBalanceCards employeeId={mockCurrentEmployee.id} month={month} />
      <MedicalHistoryTable month={month} />
    </>
  );
}
