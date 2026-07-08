'use client';

import { useMyMedicalClaims } from '@/hooks/queries/medical';

import { MedicalClaimsTable } from './medical-claims-table';

type MedicalHistoryTableProps = {
  month: string;
};

export function MedicalHistoryTable({ month }: MedicalHistoryTableProps) {
  const { data: claims, isLoading } = useMyMedicalClaims();

  return (
    <MedicalClaimsTable
      claims={claims}
      isLoading={isLoading}
      emptyDescription='Your claims and their status will show up here.'
      title='Recent Claims'
      month={month}
    />
  );
}
