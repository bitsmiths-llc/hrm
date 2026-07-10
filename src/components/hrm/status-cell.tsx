'use client';

import { Info } from 'lucide-react';

import { StatusBadge } from '@/components/hrm/status-badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { RequestStatus } from '@/types/hrm';

type StatusCellProps = {
  status: RequestStatus;
  rejectionReason?: string | null;
};

/** Status badge for a table cell. When rejected with a reason attached, the
 *  badge becomes clickable and reveals it in a popover instead of leaving
 *  the employee to guess why. */
export function StatusCell({ status, rejectionReason }: StatusCellProps) {
  if (status === 'rejected' && !!rejectionReason) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='inline-flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <StatusBadge status={status} />
            <Info className='size-3.5 text-muted-foreground' aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-72' align='start'>
          <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Reason for rejection
          </p>
          <p className='text-sm'>{rejectionReason}</p>
        </PopoverContent>
      </Popover>
    );
  }

  return <StatusBadge status={status} />;
}
