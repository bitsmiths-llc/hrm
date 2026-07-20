'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useReviewMedical } from '@/hooks/actions/use-review-medical';

import { RejectRequestDialog } from '@/components/hrm/reject-request-dialog';
import { Button } from '@/components/ui/button';

type Decision = 'approved' | 'rejected';

type MedicalReviewActionsProps = {
  itemId: string;
  employeeName: string;
  /** Called after a committed decision so the parent can close the review
   *  sheet. The queue refreshes via the mutation's own invalidation. */
  onReviewed: (decision: Decision) => void;
};

/**
 * Approve / reject controls for a single medical claim in the admin queue.
 * Backed by the real `reviewMedicalClaim` action, which re-derives the balance
 * and rejects an over-balance approval server-side — that error surfaces here as
 * a toast (the claim stays pending). Rejection reuses the shared
 * `RejectRequestDialog` for the required reason.
 */
export function MedicalReviewActions({
  itemId,
  employeeName,
  onReviewed,
}: MedicalReviewActionsProps) {
  const { executeAsync } = useReviewMedical();
  // Scoped to the approve action only, so a reject (whose spinner lives on the
  // dialog's submit button) never lights up the Approve button, and vice-versa.
  const [isApproving, setIsApproving] = useState(false);

  const approve = async () => {
    setIsApproving(true);
    const result = await executeAsync({ id: itemId, decision: 'approved' });
    setIsApproving(false);
    // The action throws (→ serverError) when amount > available; useReviewMedical's
    // onError already toasts it. Only celebrate on a committed decision.
    if (result?.data) {
      toast.success(`Medical claim for ${employeeName} approved`);
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
    toast.success(`Medical claim for ${employeeName} rejected`);
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
        title='Reject medical claim'
        description={`${employeeName} will see this reason on their claim history and by email.`}
        onConfirm={reject}
      />
      <Button className='flex-1' isLoading={isApproving} onClick={approve}>
        Approve
      </Button>
    </div>
  );
}
