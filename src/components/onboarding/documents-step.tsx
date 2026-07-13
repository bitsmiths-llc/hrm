'use client';

import { Check, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { useUploadIdentityDoc } from '@/hooks/mutations/use-upload-identity-doc';
import {
  useEmployeeDocuments,
  useIdentityDocFiles,
} from '@/hooks/queries/onboarding';

import { DocumentPreview } from '@/components/hrm/document-preview';
import { FileUpload } from '@/components/hrm/file-upload';
import { Button } from '@/components/ui/button';

import {
  IDENTITY_DOC_ACCEPT,
  IDENTITY_DOC_HINT,
  IDENTITY_DOC_MAX_SIZE_MB,
  IDENTITY_DOC_MIME_TYPES,
  identityDocuments,
} from '@/constants/onboarding';
import { type DocType } from '@/schema/onboarding';

type DocumentsStepProps = {
  userId: string;
  onNext: () => void;
  onBack: () => void;
};

/**
 * Section 4 · Identity documents. Each file uploads immediately to
 * `identity-docs` at `<uid>/<doc_type>` and upserts one `employee_documents`
 * row — re-selecting a file replaces it. Only PNG or PDF up to
 * {@link IDENTITY_DOC_MAX_SIZE_MB}MB are accepted, and each uploaded file shows
 * a preview. Continue unlocks once all three types are present.
 */
export function DocumentsStep({ userId, onNext, onBack }: DocumentsStepProps) {
  const { data: documents } = useEmployeeDocuments(userId);
  const { data: docFiles, isLoading: filesLoading } =
    useIdentityDocFiles(userId);
  const upload = useUploadIdentityDoc(userId);
  const [uploading, setUploading] = useState<DocType | null>(null);

  const docByType = new Map(
    (documents ?? []).map((doc) => [doc.doc_type, doc]),
  );
  const allUploaded = identityDocuments.every(({ docType }) =>
    docByType.has(docType),
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
        const record = docByType.get(docType);
        const isUploaded = !!record;
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
            {isUploaded && (
              <div className='flex max-w-sm flex-col gap-1.5'>
                <DocumentPreview
                  file={docFiles?.[docType]}
                  label={label}
                  isLoading={filesLoading}
                />
                {record?.file_name && (
                  <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <FileText className='size-3.5 shrink-0' aria-hidden />
                    <span className='truncate'>{record.file_name}</span>
                  </p>
                )}
              </div>
            )}
            <FileUpload
              value={[]}
              onChange={(files) => handleFile(docType, files)}
              maxFiles={1}
              maxSizeMb={IDENTITY_DOC_MAX_SIZE_MB}
              accept={IDENTITY_DOC_ACCEPT}
              allowedMimeTypes={IDENTITY_DOC_MIME_TYPES}
              hint={IDENTITY_DOC_HINT}
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
