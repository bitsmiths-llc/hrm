'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const rejectSchema = z.object({
  reason: z.string().min(5, 'Enter a reason (at least 5 characters)'),
});
type RejectInput = z.infer<typeof rejectSchema>;

type RejectRequestDialogProps = {
  /** The element that opens the dialog (rendered via asChild). */
  trigger: React.ReactNode;
  title: string;
  description: string;
  /** May be async — the dialog awaits it, so the submit button shows its
   *  loading state and the dialog stays open until the decision settles.
   *  Return `false` to keep the dialog open (e.g. the mutation failed), so the
   *  typed reason isn't lost; anything else closes it. */
  onConfirm: (reason: string) => boolean | void | Promise<boolean | void>;
};

/** Rejecting requires a reason — it's stored on the request and shown to
 *  the employee, instead of a bare status flip with no explanation. */
export function RejectRequestDialog({
  trigger,
  title,
  description,
  onConfirm,
}: RejectRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  const onSubmit = async (values: RejectInput) => {
    const result = await onConfirm(values.reason);
    if (result === false) return; // failed — keep open with the reason intact
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ScrollableDialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for rejection</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='Explain why this request is being rejected…'
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
              <Button
                type='submit'
                variant='destructive'
                isLoading={form.formState.isSubmitting}
              >
                Reject request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
