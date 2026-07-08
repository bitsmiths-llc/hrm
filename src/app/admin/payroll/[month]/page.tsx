import { Metadata } from 'next';

import { PayrollCyclePageContent } from '@/components/payroll/payroll-cycle-page-content';

export const metadata: Metadata = { title: 'Payroll Cycle' };

export default async function PayrollCyclePage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  return <PayrollCyclePageContent month={month} />;
}
