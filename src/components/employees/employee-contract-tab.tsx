'use client';

import { FileX2 } from 'lucide-react';
import { useState } from 'react';

import { useEmployeeContract } from '@/hooks/queries/contracts';

import { EmptyState } from '@/components/hrm/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { ContractVersionList } from './contract-version-list';
import { UploadContractDialog } from './upload-contract-dialog';

type EmployeeContractTabProps = {
  employeeId: string;
};

export function EmployeeContractTab({ employeeId }: EmployeeContractTabProps) {
  const { data: contract, isLoading } = useEmployeeContract(employeeId);
  const [uploadOpen, setUploadOpen] = useState(false);

  if (isLoading) return <Skeleton className='h-48 rounded-xl' />;

  const currentVersion = contract?.versions.length
    ? contract.versions[contract.versions.length - 1].version
    : 0;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button onClick={() => setUploadOpen(true)}>
          {contract ? 'Upload new version' : 'Upload contract'}
        </Button>
      </div>

      {!contract?.versions.length ? (
        <EmptyState
          icon={FileX2}
          title='No contract on file'
          description='Upload a signed contract PDF for this employee.'
        />
      ) : (
        <ContractVersionList versions={contract.versions} />
      )}

      <UploadContractDialog
        employeeId={employeeId}
        currentVersion={currentVersion}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </div>
  );
}
