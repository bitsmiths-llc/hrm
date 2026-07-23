'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ControlledTextField } from '@/components/hrm/form-fields';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { bankInfoFields } from '@/constants/onboarding';
import { type BankInfoInput, bankInfoSchema } from '@/schema/onboarding';

type BankInfoStepProps = {
  defaultValues: BankInfoInput;
  onNext: (values: BankInfoInput) => void | Promise<void>;
  onBack: () => void;
};

export function BankInfoStep({
  defaultValues,
  onNext,
  onBack,
}: BankInfoStepProps) {
  const form = useForm<BankInfoInput>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='grid gap-4 sm:grid-cols-2'
      >
        {bankInfoFields.map((config) => (
          <ControlledTextField
            key={config.name}
            control={form.control}
            config={config}
          />
        ))}
        <div className='flex justify-between sm:col-span-2'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit' isLoading={form.formState.isSubmitting}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
