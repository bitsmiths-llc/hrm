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
  type SocialAccountsInput,
  socialAccountsSchema,
} from '@/schema/onboarding';

const fields: {
  name: keyof SocialAccountsInput;
  label: string;
  placeholder: string;
}[] = [
  {
    name: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    name: 'twitter',
    label: 'Twitter (optional)',
    placeholder: 'https://twitter.com/username',
  },
];

type SocialAccountsStepProps = {
  defaultValues?: SocialAccountsInput;
  onNext: (values: SocialAccountsInput) => void;
  onBack: () => void;
};

export function SocialAccountsStep({
  defaultValues,
  onNext,
  onBack,
}: SocialAccountsStepProps) {
  const form = useForm<SocialAccountsInput>({
    resolver: zodResolver(socialAccountsSchema),
    defaultValues: defaultValues ?? { github: '', linkedin: '', twitter: '' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='flex flex-col gap-4'
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
        <div className='flex justify-between'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    </Form>
  );
}
