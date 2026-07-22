'use client';

import { useMedicalClaims } from '@/hooks/queries/medical';

import { MedicalClaimsTable } from './medical-claims-table';

type MedicalHistoryTableProps = {
  /** The signed-in employee's id. Undefined until the identity resolves — the
   *  table shows a skeleton until then. Sharing this id-keyed query with the
   *  balance widget means the page fetches the rows once. */
  employeeId?: string;
  month: string;
};

export function MedicalHistoryTable({
  employeeId,
  month,
}: MedicalHistoryTableProps) {
  const { data: claims, isLoading } = useMedicalClaims(employeeId);

  return (
    <MedicalClaimsTable
      claims={claims}
      isLoading={isLoading || !employeeId}
      emptyDescription='Your claims and their status will show up here.'
      title='Recent Claims'
      month={month}
    />
  );
}
