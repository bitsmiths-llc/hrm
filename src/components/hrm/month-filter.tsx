'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type MonthFilterProps = {
  /** 'all' or 'YYYY-MM'. */
  value: string;
  onChange: (value: string) => void;
};

/** Month dropdown for filtering a request/claim/log history table. Renders
 *  a fixed 3x4 grid for the current year (future months disabled) plus an
 *  "All time" option, so the popover stays a constant size year-round
 *  instead of growing into a long scrolling list by December. */
export function MonthFilter({ value, onChange }: MonthFilterProps) {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const label =
    value === 'all'
      ? 'All time'
      : new Date(`${value}-01T00:00:00`).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='h-8 w-40 justify-between font-normal'
        >
          {label}
          <ChevronDown className='size-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-56 p-3' align='end'>
        <button
          type='button'
          onClick={() => select('all')}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
            value === 'all' && 'bg-accent text-accent-foreground',
          )}
        >
          All time
          {value === 'all' && <Check className='size-4' />}
        </button>
        <p className='mb-1.5 px-2 text-xs text-muted-foreground'>{year}</p>
        <div className='grid grid-cols-3 gap-1'>
          {MONTH_LABELS.map((monthLabel, index) => {
            const monthValue = `${year}-${String(index + 1).padStart(2, '0')}`;
            const disabled = index > currentMonthIndex;
            const selected = value === monthValue;
            return (
              <Button
                key={monthLabel}
                type='button'
                variant={selected ? 'default' : 'ghost'}
                size='sm'
                disabled={disabled}
                className='h-9 text-xs'
                onClick={() => select(monthValue)}
              >
                {monthLabel}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
