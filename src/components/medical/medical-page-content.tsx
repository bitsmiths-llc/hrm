'use client';

import { useState } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { SubmitClaimDialog } from '@/components/medical/submit-claim-dialog';

import { MedicalBalanceCards } from './medical-balance-cards';
import { MedicalHistoryTable } from './medical-history-table';

export function MedicalPageContent() {
  const [month, setMonth] = useState('all');
  const { data: me } = useCurrentEmployee();

  return (
    <>
      <PageHeader
        title='Medical Allowance'
        description='Submit claims against your accrued allowance and track your balance.'
      >
        <MonthFilter value={month} onChange={setMonth} />
        <SubmitClaimDialog employeeId={me?.id} />
      </PageHeader>
      <MedicalBalanceCards employeeId={me?.id} />
      <MedicalHistoryTable employeeId={me?.id} month={month} />
    </>
  );
}
