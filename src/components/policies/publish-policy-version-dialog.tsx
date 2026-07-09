'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { publishPolicyVersionSchema } from '@/schema/policy';

const changeSummarySchema = publishPolicyVersionSchema.pick({
  changeSummary: true,
});
type ChangeSummaryInput = z.infer<typeof changeSummarySchema>;

type PublishPolicyVersionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (changeSummary: string) => void;
};

/** Requires a changelog note before publishing an update — this is what
 *  lets employees see what actually changed instead of re-reading the
 *  whole document, and what drives the re-acknowledgment prompt. */
export function PublishPolicyVersionDialog({
  open,
  onOpenChange,
  onConfirm,
}: PublishPolicyVersionDialogProps) {
  const form = useForm<ChangeSummaryInput>({
    resolver: zodResolver(changeSummarySchema),
    defaultValues: { changeSummary: '' },
  });

  const onSubmit = (values: ChangeSummaryInput) => {
    onConfirm(values.changeSummary);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this update?</DialogTitle>
          <DialogDescription>
            Employees who already acknowledged an earlier version will be
            prompted to re-acknowledge, with this note shown to them.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='changeSummary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What changed?</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='e.g. Increased the annual leave pool from 20 to 22 days.'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Shown to employees.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Publish new version
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
