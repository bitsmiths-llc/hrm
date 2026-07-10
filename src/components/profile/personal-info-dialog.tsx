'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateMyPersonalInfo } from '@/hooks/actions/use-update-my-profile';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { ControlledDatePicker } from '@/components/ui/form/controlled-date-picker';
import { Input } from '@/components/ui/input';

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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit personal information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => execute(values))}
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
            <ControlledDatePicker<PersonalDetailsInput>
              name='dateOfBirth'
              label='Date of birth'
              disabledDates={{ after: new Date() }}
            />
            <FormField
              control={form.control}
              name='cnic'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNIC number</FormLabel>
                  <FormControl>
                    <Input placeholder='12345-1234567-1' {...field} />
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
      </DialogContent>
    </Dialog>
  );
}
