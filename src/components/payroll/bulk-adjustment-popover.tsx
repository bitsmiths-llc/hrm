'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type BulkAdjustmentPopoverProps = {
  selectedCount: number;
  onApply: (field: { label: string; amount: number }) => void;
};

export function BulkAdjustmentPopover({
  selectedCount,
  onApply,
}: BulkAdjustmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const handleApply = () => {
    if (!label.trim() || !amount) return;
    onApply({ label: label.trim(), amount: Number(amount) });
    setLabel('');
    setAmount('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm'>
          Add Adjustment
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72'>
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>
            Add a line item to {selectedCount} selected{' '}
            {selectedCount === 1 ? 'employee' : 'employees'}.
          </p>
          <div className='flex flex-col gap-2'>
            <Input
              placeholder='Label (e.g. Bonus)'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className='h-8'
            />
            <Input
              type='number'
              placeholder='Amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='h-8'
            />
          </div>
          <Button type='button' size='sm' onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
