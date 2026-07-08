'use client';

import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
  /** 'all', 'YYYY' (whole year), or 'YYYY-MM'. */
  value: string;
  onChange: (value: string) => void;
};

/** Month dropdown for filtering a request/claim/log history table. Renders
 *  a fixed 3x4 grid (future months disabled) plus an "All time" option, so
 *  the popover stays a constant size instead of growing into a long
 *  scrolling list. Year chevrons let you page back through history — years
 *  beyond the real current year are blocked, past years are unrestricted.
 *  Clicking the year label itself filters to that whole year. */
export function MonthFilter({ value, onChange }: MonthFilterProps) {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const selectedYear =
    value !== 'all' ? Number(value.slice(0, 4)) : currentYear;
  const [viewYear, setViewYear] = useState(selectedYear);

  const label =
    value === 'all'
      ? 'All time'
      : value.length === 4
        ? value
        : new Date(`${value}-01T00:00:00`).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setViewYear(selectedYear);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='h-10 w-40 justify-between font-normal'
        >
          <span className='flex items-center gap-1.5'>
            <CalendarIcon className='size-3.5 opacity-50' />
            {label}
          </span>
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
        <div className='mb-1.5 flex items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 shrink-0'
            onClick={() => setViewYear((prev) => prev - 1)}
          >
            <ChevronLeft className='size-3.5' />
          </Button>
          <button
            type='button'
            onClick={() => select(String(viewYear))}
            className={cn(
              'flex flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
              value === String(viewYear) && 'bg-accent text-accent-foreground',
            )}
          >
            {viewYear}
            {value === String(viewYear) ? (
              <Check className='size-4' />
            ) : (
              <span className='text-xs font-normal text-muted-foreground'>
                Whole year
              </span>
            )}
          </button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 shrink-0'
            disabled={viewYear >= currentYear}
            onClick={() => setViewYear((prev) => prev + 1)}
          >
            <ChevronRight className='size-3.5' />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-1'>
          {MONTH_LABELS.map((monthLabel, index) => {
            const monthValue = `${viewYear}-${String(index + 1).padStart(2, '0')}`;
            const disabled =
              viewYear === currentYear && index > currentMonthIndex;
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
