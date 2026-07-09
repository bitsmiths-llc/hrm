import { format } from 'date-fns';
import { History } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PolicyVersion } from '@/types/hrm';

type PolicyVersionHistoryProps = {
  versions: PolicyVersion[];
  currentVersionNumber: number;
  /** Omit to hide the revert action (e.g. read-only contexts). */
  onRevert?: (version: PolicyVersion) => void;
};

export function PolicyVersionHistory({
  versions,
  currentVersionNumber,
  onRevert,
}: PolicyVersionHistoryProps) {
  const newestFirst = [...versions].reverse();

  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {newestFirst.map((version) => (
        <li
          key={version.version}
          className='flex items-center justify-between gap-3 px-4 py-3'
        >
          <span className='text-sm font-medium'>
            Version {version.version}
            {version.version === currentVersionNumber && ' (current)'}
          </span>
          <div className='flex items-center gap-3'>
            <span className='text-xs text-muted-foreground'>
              {format(version.publishedAt, 'MMM d, yyyy')}
            </span>
            {!!onRevert && version.version !== currentVersionNumber && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 gap-1.5 px-2 text-xs'
                iconLeft={History}
                onClick={() => onRevert(version)}
              >
                Revert to this
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
