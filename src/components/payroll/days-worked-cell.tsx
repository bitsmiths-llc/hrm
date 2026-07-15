'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

type DaysWorkedCellProps = {
  payslipId: string;
  daysWorked: number;
  daysInMonth: number;
  /** True while a recalc is in flight — the cell is frozen until it settles. */
  disabled?: boolean;
  onCommit: (payslipId: string, daysWorked: number) => void;
};

/** Inline days-worked editor. Edits are local until blur / Enter, so a recalc
 *  fires once per committed change (not per keystroke). Value is clamped to
 *  0..daysInMonth; committing an unchanged value is a no-op. */
export function DaysWorkedCell({
  payslipId,
  daysWorked,
  daysInMonth,
  disabled,
  onCommit,
}: DaysWorkedCellProps) {
  const [value, setValue] = useState(String(daysWorked));

  // Re-sync when the recalc returns a new authoritative value.
  useEffect(() => setValue(String(daysWorked)), [daysWorked]);

  const commit = () => {
    const clamped = Math.min(daysInMonth, Math.max(0, Number(value) || 0));
    if (clamped === daysWorked) {
      setValue(String(daysWorked)); // normalize a no-op edit back to the source
      return;
    }
    onCommit(payslipId, clamped);
  };

  return (
    <Input
      type='number'
      min={0}
      max={daysInMonth}
      step={0.5}
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className='mx-auto h-8 w-20 text-center'
      aria-label='Days worked'
    />
  );
}
