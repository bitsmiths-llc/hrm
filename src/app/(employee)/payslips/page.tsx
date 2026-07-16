import { Metadata } from 'next';

import { PayslipsPageContent } from '@/components/payroll/payslips-page-content';

export const metadata: Metadata = { title: 'Payslips' };

export default function PayslipsPage() {
  return <PayslipsPageContent />;
}
