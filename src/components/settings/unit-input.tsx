import * as React from 'react';

import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

type UnitInputProps = React.ComponentProps<'input'> & {
  /** Trailing adornment, e.g. "days", "PKR", "%", "×". */
  unit: string;
};

/** A numeric field with its unit pinned inside the trailing edge and the
 *  value right-aligned, so a column of settings reads like a console
 *  readout rather than a stack of blank boxes. */
export const UnitInput = React.forwardRef<HTMLInputElement, UnitInputProps>(
  ({ unit, className, ...props }, ref) => (
    <div className='relative'>
      <Input
        ref={ref}
        className={cn('pr-12 text-right font-medium tabular-nums', className)}
        {...props}
      />
      <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground'>
        {unit}
      </span>
    </div>
  ),
);
UnitInput.displayName = 'UnitInput';
