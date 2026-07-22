'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateEmployeeContact } from '@/hooks/actions/use-update-employee';

import { ControlledTextField } from '@/components/hrm/form-fields';
import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { contactInfoFields } from '@/constants/profile';
import { type ContactInfoInput, contactInfoSchema } from '@/schema/employee';

type AdminContactDialogProps = {
  employeeId: string;
  defaultValues: ContactInfoInput;
};

/** Admin edit of an employee's contact fields on the profile page. */
export function AdminContactDialog({
  employeeId,
  defaultValues,
}: AdminContactDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ContactInfoInput>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues,
  });

  const { execute, isPending } = useUpdateEmployeeContact(employeeId, () => {
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
      <ScrollableDialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit contact information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              execute({ ...values, employeeId }),
            )}
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
      </ScrollableDialogContent>
    </Dialog>
  );
}
