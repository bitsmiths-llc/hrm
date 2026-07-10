import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Payslips' };

export default function PayslipsPage() {
  return (
    <ComingSoon
      title='Payslips'
      description='Itemized payslips and payment history per cycle.'
    />
  );
}
