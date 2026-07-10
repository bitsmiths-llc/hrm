'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateEmployeeBank } from '@/hooks/actions/use-update-employee';

import { ControlledTextField } from '@/components/hrm/form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { bankInfoFields } from '@/constants/onboarding';
import { type BankInfoInput, bankInfoSchema } from '@/schema/onboarding';

type AdminBankDialogProps = {
  employeeId: string;
  defaultValues: BankInfoInput;
};

/** Admin edit of an employee's bank details on the profile page. */
export function AdminBankDialog({
  employeeId,
  defaultValues,
}: AdminBankDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<BankInfoInput>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues,
  });

  const { execute, isPending } = useUpdateEmployeeBank(employeeId, () => {
    toast.success('Bank details updated');
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
          <DialogTitle>Edit bank details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              execute({ ...values, employeeId }),
            )}
            className='flex flex-col gap-4'
          >
            {bankInfoFields.map((config) => (
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
