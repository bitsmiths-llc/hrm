'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateMyPersonalInfo } from '@/hooks/actions/use-update-my-profile';

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
import { ControlledDatePicker } from '@/components/ui/form/controlled-date-picker';

import { personalDetailsFields } from '@/constants/profile';
import {
  type PersonalDetailsInput,
  personalDetailsSchema,
} from '@/schema/employee';

type PersonalInfoDialogProps = {
  defaultValues: PersonalDetailsInput;
};

/** Admins maintain their own identity fields (name, DOB, CNIC) here. Employees'
 *  personal info is admin-managed and stays read-only on their profile — an
 *  admin has no admin above them, so they self-edit. */
export function PersonalInfoDialog({ defaultValues }: PersonalInfoDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<PersonalDetailsInput>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues,
  });

  const { execute, isPending } = useUpdateMyPersonalInfo(() => {
    toast.success('Personal information updated');
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
          <DialogTitle>Edit personal information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => execute(values))}
            className='flex flex-col gap-4'
          >
            {personalDetailsFields.map((config, index) => (
              <React.Fragment key={config.name}>
                <ControlledTextField control={form.control} config={config} />
                {index === 0 && (
                  <ControlledDatePicker<PersonalDetailsInput>
                    name='dateOfBirth'
                    label='Date of birth'
                    disabledDates={{ after: new Date() }}
                  />
                )}
              </React.Fragment>
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
