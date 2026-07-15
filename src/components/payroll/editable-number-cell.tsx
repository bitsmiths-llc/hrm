'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

type EditableNumberCellProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** True while a recalc is in flight — the cell is frozen until it settles. */
  disabled?: boolean;
  ariaLabel: string;
  onCommit: (value: number) => void;
};

/** Inline numeric editor for the draft grid (days worked, OT multiplier). Edits
 *  are local until blur / Enter, so the server recalc fires once per committed
 *  change — not per keystroke. Value is clamped to [min, max]; committing an
 *  unchanged value is a no-op. */
export function EditableNumberCell({
  value,
  min = 0,
  max,
  step = 1,
  disabled,
  ariaLabel,
  onCommit,
}: EditableNumberCellProps) {
  const [draft, setDraft] = useState(String(value));

  // Re-sync when the recalc returns a new authoritative value.
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(min, max === undefined ? parsed : Math.min(max, parsed));
    if (clamped === value) {
      setDraft(String(value)); // normalize a no-op edit back to the source
      return;
    }
    onCommit(clamped);
  };

  return (
    <Input
      type='number'
      min={min}
      max={max}
      step={step}
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className='mx-auto h-8 w-20 text-center'
      aria-label={ariaLabel}
    />
  );
}
