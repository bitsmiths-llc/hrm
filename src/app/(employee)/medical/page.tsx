import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Medical' };

export default function MedicalPage() {
  return (
    <ComingSoon
      title='Medical Allowance'
      description='Submit claims against your accrued allowance and track your balance.'
    />
  );
}
