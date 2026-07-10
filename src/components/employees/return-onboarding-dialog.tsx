'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useReturnOnboarding } from '@/hooks/actions/use-review-employee';

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
  type ReturnOnboardingInput,
  returnOnboardingSchema,
} from '@/schema/employee';

type ReturnOnboardingDialogProps = {
  employeeId: string;
  employeeName: string;
};

/** Returns a submission to onboarding with a required note. The note becomes the
 *  employee's `review_note` — surfaced on their onboarding wizard so they know
 *  what to fix. Surfaced from the employees table row and the employee detail
 *  page for `submitted` employees. */
export function ReturnOnboardingDialog({
  employeeId,
  employeeName,
}: ReturnOnboardingDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ReturnOnboardingInput>({
    resolver: zodResolver(returnOnboardingSchema),
    defaultValues: { reviewNote: '' },
  });

  const { execute, isPending } = useReturnOnboarding(() => {
    toast.success(`Returned to ${employeeName} for changes`);
    form.reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' iconLeft={RotateCcw}>
          Return
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Return for changes</DialogTitle>
          <DialogDescription>
            {employeeName} moves back to onboarding and sees your note. They can
            edit and resubmit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              execute({ ...values, employeeId }),
            )}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='reviewNote'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What needs changing?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='e.g. Your CNIC number doesn’t match the uploaded document — please correct it.'
                      rows={4}
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Return submission
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
