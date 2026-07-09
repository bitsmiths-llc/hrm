'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
  /** Auto-detected from a section-by-section diff of the content — see
   *  `summarizePolicyChanges`. Pre-fills the field so admin reviews and
   *  adjusts instead of writing it from a blank box. */
  suggestedSummary: string;
};

/** Requires a changelog note before publishing an update — this is what
 *  lets employees see what actually changed instead of re-reading the
 *  whole document, and what drives the re-acknowledgment prompt. */
export function PublishPolicyVersionDialog({
  open,
  onOpenChange,
  onConfirm,
  suggestedSummary,
}: PublishPolicyVersionDialogProps) {
  const form = useForm<ChangeSummaryInput>({
    resolver: zodResolver(changeSummarySchema),
    defaultValues: { changeSummary: suggestedSummary },
  });

  // The dialog stays mounted between opens, so re-seed the field with a
  // fresh diff each time it opens rather than only on first mount.
  useEffect(() => {
    if (open) form.reset({ changeSummary: suggestedSummary });
  }, [open, suggestedSummary, form]);

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
            We've drafted a summary of what changed from your edits — review and
            adjust it before publishing. Employees who already acknowledged an
            earlier version will be prompted to re-acknowledge, with this note
            shown to them.
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    Auto-detected from your edits — shown to employees as-is.
                  </FormDescription>
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
