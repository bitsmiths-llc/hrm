import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Payroll' };

export default function PayrollPage() {
  return (
    <ComingSoon
      title='Payroll'
      description='Run cycles, review calculations, lock, and export for Payoneer.'
    />
  );
}
