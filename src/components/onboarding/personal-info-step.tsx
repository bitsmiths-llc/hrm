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

import {
  type PersonalInfoInput,
  personalInfoSchema,
} from '@/schema/onboarding';

const fields: {
  name: keyof PersonalInfoInput;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { name: 'fullName', label: 'Full name', placeholder: 'Ayesha Khan' },
  {
    name: 'dateOfBirth',
    label: 'Date of birth',
    placeholder: '',
    type: 'date',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@bitsmiths.studio',
    type: 'email',
  },
  { name: 'phone', label: 'Phone number', placeholder: '+92 300 1234567' },
  {
    name: 'emergencyContact',
    label: 'Emergency contact number',
    placeholder: '+92 301 7654321',
  },
  {
    name: 'address',
    label: 'Residential address',
    placeholder: 'House, street, area, city',
  },
  { name: 'cnic', label: 'CNIC number', placeholder: '12345-1234567-1' },
];

type PersonalInfoStepProps = {
  defaultValues?: PersonalInfoInput;
  onNext: (values: PersonalInfoInput) => void;
};

export function PersonalInfoStep({
  defaultValues,
  onNext,
}: PersonalInfoStepProps) {
  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues ?? {
      fullName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      emergencyContact: '',
      address: '',
      cnic: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='grid gap-4 sm:grid-cols-2'
      >
        {fields.map(({ name, label, placeholder, type }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className={name === 'address' ? 'sm:col-span-2' : ''}>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type={type} placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className='flex justify-end sm:col-span-2'>
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    </Form>
  );
}
