import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { LogOvertimeDialog } from '@/components/overtime/log-overtime-dialog';
import { OvertimeHistoryTable } from '@/components/overtime/overtime-history-table';
import { OvertimeSummaryCards } from '@/components/overtime/overtime-summary-cards';

export const metadata: Metadata = { title: 'Overtime' };

export default function OvertimePage() {
  return (
    <>
      <PageHeader
        title='Overtime'
        description='Log extra hours and track their approval status.'
      >
        <LogOvertimeDialog />
      </PageHeader>
      <OvertimeSummaryCards />
      <OvertimeHistoryTable />
    </>
  );
}
