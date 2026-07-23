'use client';

import { useState } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { SubmitClaimDialog } from '@/components/medical/submit-claim-dialog';

import { currentYear } from '@/utils/date-functions';

import { MedicalBalanceCards } from './medical-balance-cards';
import { MedicalHistoryTable } from './medical-history-table';

export function MedicalPageContent() {
  // Default the claim history to the current year; the filter can widen it.
  // (The balance cards are a lifetime rolling accrual and ignore this.)
  const [month, setMonth] = useState(currentYear());
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
