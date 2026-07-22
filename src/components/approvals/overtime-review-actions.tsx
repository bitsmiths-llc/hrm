'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useReviewOvertime } from '@/hooks/actions/use-review-overtime';

import { RejectRequestDialog } from '@/components/hrm/reject-request-dialog';
import { Button } from '@/components/ui/button';

type Decision = 'approved' | 'rejected';

type OvertimeReviewActionsProps = {
  itemId: string;
  employeeName: string;
  /** Called after a committed decision so the parent can close the review
   *  sheet. The queue refreshes via the mutation's own invalidation. */
  onReviewed: (decision: Decision) => void;
};

/**
 * Approve / reject controls for a single overtime log in the admin queue.
 * Backed by the real `reviewOvertimeLog` action (stamps status/reviewer, emails
 * the employee). Rejection reuses the shared `RejectRequestDialog` for the
 * required reason.
 */
export function OvertimeReviewActions({
  itemId,
  employeeName,
  onReviewed,
}: OvertimeReviewActionsProps) {
  const { executeAsync } = useReviewOvertime();
  // Scoped to the approve action only, so a reject (whose spinner lives on the
  // dialog's submit button) never lights up the Approve button, and vice-versa.
  const [isApproving, setIsApproving] = useState(false);

  const approve = async () => {
    setIsApproving(true);
    const result = await executeAsync({ id: itemId, decision: 'approved' });
    setIsApproving(false);
    if (result?.data) {
      toast.success(`Overtime for ${employeeName} approved`);
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
    toast.success(`Overtime for ${employeeName} rejected`);
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
        title='Reject overtime log'
        description={`${employeeName} will see this reason on their overtime history and by email.`}
        onConfirm={reject}
      />
      <Button className='flex-1' isLoading={isApproving} onClick={approve}>
        Approve
      </Button>
    </div>
  );
}
