'use client';

import { useIdentityDocFiles } from '@/hooks/queries/onboarding';

import { DocumentPreview } from '@/components/hrm/document-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { identityDocuments } from '@/constants/onboarding';

type EmployeeDocumentsProps = {
  employeeId: string;
};

/** Admin-facing previews of an employee's uploaded identity documents. Reads
 *  signed URLs via the `idocs_admin` storage policy; missing documents show a
 *  placeholder so it's clear what's outstanding. */
export function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
  const { data: docFiles, isLoading } = useIdentityDocFiles(employeeId);

  const hasAny = identityDocuments.some(({ docType }) => docFiles?.[docType]);

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>
          Identity Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && !hasAny ? (
          <p className='text-sm text-muted-foreground'>
            No documents uploaded yet.
          </p>
        ) : (
          <div className='grid gap-6 sm:grid-cols-3'>
            {identityDocuments.map(({ docType, label }) => {
              const file = docFiles?.[docType];
              return (
                <div key={docType} className='flex flex-col gap-2'>
                  <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    {label}
                  </span>
                  {isLoading ? (
                    <DocumentPreview label={label} isLoading />
                  ) : file ? (
                    <DocumentPreview file={file} label={label} />
                  ) : (
                    <div className='flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground'>
                      Not uploaded
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
