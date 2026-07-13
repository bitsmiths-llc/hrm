'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type BulkOtRatePopoverProps = {
  selectedCount: number;
  onApply: (multiplier: number) => void;
};

export function BulkOtRatePopover({
  selectedCount,
  onApply,
}: BulkOtRatePopoverProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('1.5');

  const handleApply = () => {
    const multiplier = Math.max(0, Number(value));
    onApply(multiplier);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm'>
          Set OT Rate
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64'>
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>
            Apply an overtime multiplier to {selectedCount} selected{' '}
            {selectedCount === 1 ? 'employee' : 'employees'}.
          </p>
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              step={0.1}
              min={0}
              max={5}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className='h-8'
            />
            <Button type='button' size='sm' onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
