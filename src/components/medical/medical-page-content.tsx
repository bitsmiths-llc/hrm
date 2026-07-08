'use client';

import { useState } from 'react';

import { MonthFilter } from '@/components/hrm/month-filter';
import { PageHeader } from '@/components/hrm/page-header';
import { SubmitClaimDialog } from '@/components/medical/submit-claim-dialog';

import { getMedicalIneligibilityReason } from '@/lib/medical-eligibility';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { MedicalBalanceCards } from './medical-balance-cards';
import { MedicalHistoryTable } from './medical-history-table';

export function MedicalPageContent() {
  const [month, setMonth] = useState('all');
  const ineligibilityReason =
    getMedicalIneligibilityReason(mockCurrentEmployee);

  return (
    <>
      <PageHeader
        title='Medical Allowance'
        description='Submit claims against your accrued allowance and track your balance.'
      >
        <MonthFilter value={month} onChange={setMonth} />
        <SubmitClaimDialog disabled={!!ineligibilityReason} />
      </PageHeader>
      {!!ineligibilityReason && (
        <div className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
          {ineligibilityReason}
        </div>
      )}
      <MedicalBalanceCards employeeId={mockCurrentEmployee.id} month={month} />
      <MedicalHistoryTable month={month} />
    </>
  );
}
