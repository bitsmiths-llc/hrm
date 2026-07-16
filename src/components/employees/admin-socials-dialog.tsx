'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateEmployeeSocials } from '@/hooks/actions/use-update-employee';

import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
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
import { Input } from '@/components/ui/input';

import {
  type SocialAccountsInput,
  socialAccountsSchema,
} from '@/schema/onboarding';

type AdminSocialsDialogProps = {
  employeeId: string;
  defaultValues: SocialAccountsInput;
};

/** Admin edit of an employee's social accounts on the profile page. */
export function AdminSocialsDialog({
  employeeId,
  defaultValues,
}: AdminSocialsDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<SocialAccountsInput>({
    resolver: zodResolver(socialAccountsSchema),
    defaultValues,
  });

  const { execute, isPending } = useUpdateEmployeeSocials(employeeId, () => {
    toast.success('Social accounts updated');
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' iconLeft={Pencil}>
          Edit
        </Button>
      </DialogTrigger>
      <ScrollableDialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit social accounts</DialogTitle>
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
              name='github'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://github.com/…' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='linkedin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://linkedin.com/in/…' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='twitter'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://twitter.com/…'
                      {...field}
                      value={field.value ?? ''}
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
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
