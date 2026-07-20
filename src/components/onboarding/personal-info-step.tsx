'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ControlledTextField } from '@/components/hrm/form-fields';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ControlledDatePicker } from '@/components/ui/form/controlled-date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { personalInfoFields } from '@/constants/onboarding';
import {
  type PersonalInfoInput,
  personalInfoSchema,
} from '@/schema/onboarding';

type PersonalInfoStepProps = {
  /** Set at invite time and not editable here — shown read-only for reference. */
  email: string;
  defaultValues: PersonalInfoInput;
  onNext: (values: PersonalInfoInput) => void | Promise<void>;
};

export function PersonalInfoStep({
  email,
  defaultValues,
  onNext,
}: PersonalInfoStepProps) {
  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onNext)}
        className='grid gap-4 sm:grid-cols-2'
      >
        <div className='flex flex-col gap-2 sm:col-span-2'>
          <Label htmlFor='onboarding-email'>Email</Label>
          <Input id='onboarding-email' value={email} disabled readOnly />
        </div>
        {personalInfoFields.map((config, index) => (
          <React.Fragment key={config.name}>
            <ControlledTextField control={form.control} config={config} />
            {index === 0 && (
              <ControlledDatePicker<PersonalInfoInput>
                name='dateOfBirth'
                label='Date of birth'
                disabledDates={{ after: new Date() }}
              />
            )}
          </React.Fragment>
        ))}
        <div className='flex justify-end sm:col-span-2'>
          <Button type='submit' isLoading={form.formState.isSubmitting}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
