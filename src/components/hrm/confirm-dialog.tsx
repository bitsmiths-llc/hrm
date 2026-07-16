'use client';

import { useState } from 'react';

import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ConfirmDialogProps = {
  /** The element that opens the dialog (rendered via asChild). */
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Style the confirm button as destructive (reject, delete, lock). */
  destructive?: boolean;
  /** Extra loading flag from the caller (OR-ed with the internal await state). */
  isLoading?: boolean;
  /** May be async — the dialog awaits it, keeping itself open with the confirm
   *  button in its loading state until the action settles. */
  onConfirm: () => void | Promise<unknown>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const busy = isLoading || isConfirming;

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      // Don't let an Esc / outside-click close the dialog mid-action.
      onOpenChange={(next) => !busy && setOpen(next)}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ScrollableDialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            isLoading={busy}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
