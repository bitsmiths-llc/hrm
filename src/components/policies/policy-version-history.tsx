import { format } from 'date-fns';

import { PolicyVersion } from '@/types/hrm';

type PolicyVersionHistoryProps = {
  versions: PolicyVersion[];
};

export function PolicyVersionHistory({ versions }: PolicyVersionHistoryProps) {
  const newestFirst = [...versions].reverse();

  return (
    <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
      {newestFirst.map((version) => (
        <li key={version.version} className='flex flex-col gap-1 px-4 py-3'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-sm font-medium'>
              Version {version.version}
            </span>
            <span className='text-xs text-muted-foreground'>
              {format(version.publishedAt, 'MMM d, yyyy')}
            </span>
          </div>
          <p className='text-sm text-muted-foreground'>
            {version.changeSummary ?? 'Initial version.'}
          </p>
        </li>
      ))}
    </ul>
  );
}
