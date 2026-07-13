'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useReviewLeave } from '@/hooks/actions/use-review-leave';

import { RejectRequestDialog } from '@/components/hrm/reject-request-dialog';
import { Button } from '@/components/ui/button';

type Decision = 'approved' | 'rejected';

type LeaveReviewActionsProps = {
  itemId: string;
  employeeName: string;
  /** Called after a committed decision so the parent can close the review
   *  sheet. The queue refreshes via the mutation's own invalidation. */
  onReviewed: (decision: Decision) => void;
};

/**
 * Approve / reject controls for a single leave request in the admin queue.
 * Backed by the real `reviewLeaveRequest` action (stamps status/reviewer,
 * updates the balance, emails the employee). Rejection reuses the shared
 * `RejectRequestDialog` for the required reason.
 */
export function LeaveReviewActions({
  itemId,
  employeeName,
  onReviewed,
}: LeaveReviewActionsProps) {
  const { executeAsync } = useReviewLeave();
  // Scoped to the approve action only, so a reject (whose spinner lives on the
  // dialog's submit button) never lights up the Approve button, and vice-versa.
  const [isApproving, setIsApproving] = useState(false);

  const approve = async () => {
    setIsApproving(true);
    const result = await executeAsync({ id: itemId, decision: 'approved' });
    setIsApproving(false);
    if (result?.data) {
      toast.success(`Leave for ${employeeName} approved`);
      onReviewed('approved');
    }
  };

  // Async so RejectRequestDialog can await it: its submit button shows the
  // loading state and the dialog stays open until the decision settles.
  const reject = async (reason: string) => {
    const result = await executeAsync({
      id: itemId,
      decision: 'rejected',
      rejectionReason: reason,
    });
    if (!result?.data) return false; // keep the dialog open; reason preserved
    toast.success(`Leave for ${employeeName} rejected`);
    onReviewed('rejected');
    return true;
  };

  return (
    <div className='flex w-full gap-2'>
      <RejectRequestDialog
        trigger={
          <Button
            variant='destructive'
            className='flex-1'
            disabled={isApproving}
          >
            Reject
          </Button>
        }
        title='Reject leave request'
        description={`${employeeName} will see this reason on their leave history and by email.`}
        onConfirm={reject}
      />
      <Button className='flex-1' isLoading={isApproving} onClick={approve}>
        Approve
      </Button>
    </div>
  );
}
