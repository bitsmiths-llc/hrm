'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

type CopyButtonProps = {
  /** The text written to the clipboard. */
  value: string;
  /** What was copied, e.g. "email" — used for the toast and aria-label. */
  label?: string;
  className?: string;
};

/** Small ghost icon button that copies a value and briefly shows a check.
 *  Reused wherever a field should be one-click copyable (team directory,
 *  placeholder chips, etc.). */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `Copied ${label}` : 'Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      onClick={copy}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      className={cn('size-8 shrink-0 text-muted-foreground', className)}
    >
      {copied ? <Check className='text-primary' /> : <Copy />}
    </Button>
  );
}
