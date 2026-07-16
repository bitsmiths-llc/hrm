'use client';

import { toast } from 'sonner';

import { useCancelInvite } from '@/hooks/actions/use-invite-employee';

import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CancelInviteDialogProps = {
  employeeId: string;
  employeeName: string;
  /** Controlled by the caller — the trigger lives in the row's actions menu, so
   *  the dialog is rendered outside that menu and opened via these props. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Confirmation for revoking a pending invitation. It's destructive — the
 *  invitee's account is deleted outright — so it's gated behind an explicit
 *  confirm rather than firing straight from the menu. */
export function CancelInviteDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: CancelInviteDialogProps) {
  const { execute, isPending } = useCancelInvite(() => {
    toast.success(`Invitation for ${employeeName} cancelled`);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className='sm:max-w-md'>
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
            onClick={() => onOpenChange(false)}
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
      </ScrollableDialogContent>
    </Dialog>
  );
}
