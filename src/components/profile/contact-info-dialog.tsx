'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateMyProfile } from '@/hooks/actions/use-update-my-profile';

import { ControlledTextField } from '@/components/hrm/form-fields';
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
import { Form } from '@/components/ui/form';

import { contactInfoFields } from '@/constants/profile';
import { type ContactInfoInput, contactInfoSchema } from '@/schema/employee';

type ContactInfoDialogProps = {
  defaultValues: ContactInfoInput;
};

/** Employees may self-edit contact fields only (PRD 3.1) — everything else
 *  is admin-managed. */
export function ContactInfoDialog({ defaultValues }: ContactInfoDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ContactInfoInput>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues,
  });

  const { execute, isPending } = useUpdateMyProfile(() => {
    toast.success('Contact information updated');
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' iconLeft={Pencil}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit contact information</DialogTitle>
          <DialogDescription>
            Other profile fields are managed by your admin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => execute(values))}
            className='flex flex-col gap-4'
          >
            {contactInfoFields.map((config) => (
              <ControlledTextField
                key={config.name}
                control={form.control}
                config={config}
              />
            ))}
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
      </DialogContent>
    </Dialog>
  );
}
