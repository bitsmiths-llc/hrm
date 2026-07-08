import { Metadata } from 'next';

import { AdminPayrollPageContent } from '@/components/payroll/admin-payroll-page-content';

export const metadata: Metadata = { title: 'Payroll' };

export default function PayrollPage() {
  return <AdminPayrollPageContent />;
}
