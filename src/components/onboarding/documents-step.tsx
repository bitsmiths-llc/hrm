'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { useUploadIdentityDoc } from '@/hooks/mutations/use-upload-identity-doc';
import { useEmployeeDocuments } from '@/hooks/queries/onboarding';

import { FileUpload } from '@/components/hrm/file-upload';
import { Button } from '@/components/ui/button';

import { identityDocuments } from '@/constants/onboarding';
import { type DocType } from '@/schema/onboarding';

type DocumentsStepProps = {
  userId: string;
  onNext: () => void;
  onBack: () => void;
};

/**
 * Section 4 · Identity documents. Each file uploads immediately to
 * `identity-docs` at `<uid>/<doc_type>` and upserts one `employee_documents`
 * row — re-selecting a file replaces it. Continue unlocks once all three types
 * are present.
 */
export function DocumentsStep({ userId, onNext, onBack }: DocumentsStepProps) {
  const { data: documents } = useEmployeeDocuments(userId);
  const upload = useUploadIdentityDoc(userId);
  const [uploading, setUploading] = useState<DocType | null>(null);

  const uploadedTypes = new Set(documents?.map((doc) => doc.doc_type));
  const allUploaded = identityDocuments.every(({ docType }) =>
    uploadedTypes.has(docType),
  );

  const handleFile = (docType: DocType, files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(docType);
    upload.mutate({ docType, file }, { onSettled: () => setUploading(null) });
  };

  return (
    <div className='flex flex-col gap-6'>
      {identityDocuments.map(({ docType, label }) => {
        const isUploaded = uploadedTypes.has(docType);
        const isUploading = uploading === docType;
        return (
          <div key={docType} className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>{label}</span>
              {isUploading ? (
                <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Loader2 className='size-3 animate-spin' aria-hidden />
                  Uploading…
                </span>
              ) : (
                isUploaded && (
                  <span className='flex items-center gap-1 text-xs text-primary'>
                    <Check className='size-3' aria-hidden />
                    Uploaded
                  </span>
                )
              )}
            </div>
            <FileUpload
              value={[]}
              onChange={(files) => handleFile(docType, files)}
              maxFiles={1}
              accept='image/*,.pdf'
              label={isUploaded ? 'Replace file' : 'Upload file'}
            />
          </div>
        );
      })}
      <div className='flex justify-between'>
        <Button type='button' variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button type='button' onClick={onNext} disabled={!allUploaded}>
          Continue
        </Button>
      </div>
    </div>
  );
}
