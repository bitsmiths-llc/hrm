'use client';

import { format } from 'date-fns';
import { FileText } from 'lucide-react';

import { useContractFileUrls } from '@/hooks/queries/contracts';

import { cn } from '@/lib/utils';

import { ContractVersion } from '@/types/hrm';

type ContractVersionListProps = {
  versions: ContractVersion[];
};

/** The `contracts` bucket is private, so each row opens through a short-lived
 *  signed URL minted on render (see `proof-files-list.tsx` for the same
 *  pattern). A row stays inert until its URL resolves. */
export function ContractVersionList({ versions }: ContractVersionListProps) {
  const { data: urls } = useContractFileUrls(
    versions.map((version) => version.storagePath),
  );
  const newestFirst = [...versions].reverse();

  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {newestFirst.map((version) => {
        const url = urls?.[version.storagePath];

        return (
          <li key={version.version} className='px-4 py-3'>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              aria-disabled={!url}
              className={cn(
                'flex items-center gap-3 hover:text-primary',
                !url && 'pointer-events-none opacity-60',
              )}
            >
              <FileText
                className='size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='truncate text-sm font-medium'>
                  {version.fileName}
                </span>
                <span className='text-xs text-muted-foreground'>
                  Version {version.version} · Uploaded{' '}
                  {format(version.uploadedAt, 'MMM d, yyyy')}
                  {!!version.note && ` · ${version.note}`}
                </span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
