'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useReviewLeave } from '@/hooks/actions/use-review-leave';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import {
  type RejectLeaveReasonInput,
  rejectLeaveReasonSchema,
} from '@/schema/leave';

type Decision = 'approved' | 'rejected';

type LeaveReviewActionsProps = {
  itemId: string;
  employeeName: string;
  /** Called after a committed decision so the parent can hide the row + close
   *  the review sheet. */
  onReviewed: (decision: Decision) => void;
};

/**
 * Approve / reject controls for a single leave request in the admin queue.
 * Rejection opens a dialog for the required reason (stored on the row, emailed
 * to the employee, and shown in their history). Owns the `reviewLeaveRequest`
 * mutation so the queue itself stays presentational.
 */
export function LeaveReviewActions({
  itemId,
  employeeName,
  onReviewed,
}: LeaveReviewActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const { executeAsync, isPending } = useReviewLeave();

  const form = useForm<RejectLeaveReasonInput>({
    resolver: zodResolver(rejectLeaveReasonSchema),
    defaultValues: { rejectionReason: '' },
  });

  const approve = async () => {
    const result = await executeAsync({ id: itemId, decision: 'approved' });
    if (result?.data) {
      toast.success(`Leave for ${employeeName} approved`);
      onReviewed('approved');
    }
  };

  const reject = async ({ rejectionReason }: RejectLeaveReasonInput) => {
    const result = await executeAsync({
      id: itemId,
      decision: 'rejected',
      rejectionReason,
    });
    if (result?.data) {
      toast.success(`Leave for ${employeeName} rejected`);
      setRejectOpen(false);
      form.reset();
      onReviewed('rejected');
    }
  };

  return (
    <div className='flex w-full gap-2'>
      <Button
        variant='destructive'
        className='flex-1'
        disabled={isPending}
        onClick={() => setRejectOpen(true)}
      >
        Reject
      </Button>
      <Button className='flex-1' isLoading={isPending} onClick={approve}>
        Approve
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Reject leave request</DialogTitle>
            <DialogDescription>
              {employeeName} will see this reason on their leave history and by
              email.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(reject)}
              className='flex flex-col gap-4'
            >
              <FormField
                control={form.control}
                name='rejectionReason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for rejection</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder='e.g. Pool exhausted for the year — please resubmit as unpaid.'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setRejectOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  isLoading={isPending}
                >
                  Reject request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
