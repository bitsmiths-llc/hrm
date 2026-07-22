'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useApproveEmployee,
  useReturnOnboarding,
} from '@/hooks/actions/use-review-employee';

import { RejectRequestDialog } from '@/components/hrm/reject-request-dialog';
import { Button } from '@/components/ui/button';

import { QueryKeys } from '@/constants/query-keys';

type Decision = 'approved' | 'rejected';

type OnboardingReviewActionsProps = {
  /** The `submitted` employee's id — for onboarding the employee *is* the item. */
  itemId: string;
  employeeName: string;
  /** Called after a committed decision so the parent can close the review
   *  sheet. The queue refreshes via the invalidation below. */
  onReviewed: (decision: Decision) => void;
};

/**
 * Approve / reject controls for a single onboarding submission in the admin
 * queue. Reuses the module's existing actions — `approveEmployee` (→ active) and
 * `returnOnboarding` (→ onboarding with a required note). "Reject" here means
 * "return for changes": the reason becomes the employee's review note, surfaced
 * on their onboarding wizard, via the shared `RejectRequestDialog`.
 *
 * use-review-employee invalidates in `useAction.onSuccess`, but the queue closes
 * this sheet on success — unmounting before that effect can run (the same race
 * the leave/medical/overtime hooks document). So we invalidate off the awaited
 * result here, then close.
 */
export function OnboardingReviewActions({
  itemId,
  employeeName,
  onReviewed,
}: OnboardingReviewActionsProps) {
  const queryClient = useQueryClient();
  const approve = useApproveEmployee();
  const returnOnboarding = useReturnOnboarding();
  // Scoped to the approve action only, so a reject (whose spinner lives on the
  // dialog's submit button) never lights up the Approve button, and vice-versa.
  const [isApproving, setIsApproving] = useState(false);

  const refreshQueue = () => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES_BY_STATUS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.PENDING_APPROVALS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_SUMMARY] });
  };

  const onApprove = async () => {
    setIsApproving(true);
    const result = await approve.executeAsync({ employeeId: itemId });
    setIsApproving(false);
    if (result?.data) {
      refreshQueue();
      toast.success(`${employeeName} approved and activated`);
      onReviewed('approved');
    }
  };

  // Async so RejectRequestDialog can await it: its submit button shows the
  // loading state and the dialog stays open until the decision settles.
  const onReject = async (reason: string) => {
    const result = await returnOnboarding.executeAsync({
      employeeId: itemId,
      reviewNote: reason,
    });
    if (!result?.data) return false; // keep the dialog open; reason preserved
    refreshQueue();
    toast.success(`Returned to ${employeeName} for changes`);
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
        title='Return onboarding for changes'
        description={`${employeeName} moves back to onboarding, sees this note, and can resubmit.`}
        onConfirm={onReject}
      />
      <Button className='flex-1' isLoading={isApproving} onClick={onApprove}>
        Approve
      </Button>
    </div>
  );
}
