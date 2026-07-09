import { format } from 'date-fns';
import { FileText } from 'lucide-react';

import { ContractVersion } from '@/types/hrm';

type ContractVersionListProps = {
  versions: ContractVersion[];
};

/** Every version links to the same placeholder PDF — uploads aren't wired
 *  to real storage yet (see proof-files-list.tsx for the same pattern). */
export function ContractVersionList({ versions }: ContractVersionListProps) {
  const newestFirst = [...versions].reverse();

  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {newestFirst.map((version) => (
        <li key={version.version} className='px-4 py-3'>
          <a
            href='/mock-documents/mock-proof.pdf'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-3 hover:text-primary'
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
      ))}
    </ul>
  );
}
