'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
        {bankInfoFields.map(({ name, label, placeholder }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
