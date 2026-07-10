'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCancelInvite } from '@/hooks/actions/use-invite-employee';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type CancelInviteDialogProps = {
  employeeId: string;
  employeeName: string;
};

/** Confirmation for revoking a pending invitation. It's destructive — the
 *  invitee's account is deleted outright — so it's gated behind an explicit
 *  confirm rather than firing straight from the row. */
export function CancelInviteDialog({
  employeeId,
  employeeName,
}: CancelInviteDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, isPending } = useCancelInvite(() => {
    toast.success(`Invitation for ${employeeName} cancelled`);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' iconLeft={X}>
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Cancel invitation</DialogTitle>
          <DialogDescription>
            This permanently removes the pending invitation for {employeeName}{' '}
            and stops their invite link from working. You can invite this email
            again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Keep invitation
          </Button>
          <Button
            variant='destructive'
            isLoading={isPending}
            onClick={() => execute({ employeeId })}
          >
            Cancel invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
