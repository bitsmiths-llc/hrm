'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';

import { paths } from '@/constants/paths';
import {
  type InviteEmployeeInput,
  inviteEmployeeSchema,
} from '@/schema/employee';

export function InviteEmployeeDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<InviteEmployeeInput>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const onSubmit = async (values: InviteEmployeeInput) => {
    // Frontend-only phase: simulate the invitation request.
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(`Invitation sent to ${values.email}`);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button iconLeft={UserPlus}>Invite employee</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite an employee</DialogTitle>
          <DialogDescription>
            They&apos;ll receive an email link to set up their account and
            complete onboarding.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder='Ayesha Khan' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='ayesha@bitsmiths.studio'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3'>
              <Mail
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div className='flex flex-col gap-1 text-sm'>
                <p className='text-muted-foreground'>
                  The onboarding email will be sent to this address with their
                  invitation link.
                </p>
                <Link
                  href={`${paths.admin.policies}?tab=onboarding-email`}
                  className='font-medium text-primary hover:underline'
                >
                  View or edit the onboarding email
                </Link>
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
