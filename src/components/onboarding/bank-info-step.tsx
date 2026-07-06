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

import { type BankInfoInput,bankInfoSchema } from '@/schema/onboarding';

const fields: {
  name: keyof BankInfoInput;
  label: string;
  placeholder: string;
}[] = [
  { name: 'bankName', label: 'Bank name', placeholder: 'Meezan Bank' },
  {
    name: 'accountHolderName',
    label: 'Account holder name',
    placeholder: 'Ayesha Khan',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    placeholder: '01234567890123',
  },
  { name: 'iban', label: 'IBAN', placeholder: 'PK36MEZN0001234567890123' },
  {
    name: 'branch',
    label: 'Bank branch (optional)',
    placeholder: 'F-8 Markaz, Islamabad',
  },
];

type BankInfoStepProps = {
  defaultValues?: BankInfoInput;
  onNext: (values: BankInfoInput) => void;
  onBack: () => void;
};

export function BankInfoStep({
  defaultValues,
  onNext,
  onBack,
}: BankInfoStepProps) {
  const form = useForm<BankInfoInput>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: defaultValues ?? {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      iban: '',
      branch: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='grid gap-4 sm:grid-cols-2'
      >
        {fields.map(({ name, label, placeholder }) => (
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
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    </Form>
  );
}
