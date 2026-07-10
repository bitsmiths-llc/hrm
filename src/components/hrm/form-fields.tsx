'use client';

import { type Control, type FieldValues, type Path } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

import { MaskedInput } from './masked-input';

/** Declarative config for a single text/masked field, kept in `constants/*`. */
export type TextFieldConfig<TName extends string = string> = {
  name: TName;
  label: string;
  placeholder?: string;
  /** `digits` allows digits only; `cnic` auto-inserts dashes. */
  mask?: 'digits' | 'cnic';
  maxLength?: number;
  /** Span both columns in a 2-column grid layout. */
  fullWidth?: boolean;
};

type ControlledTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  config: TextFieldConfig<Path<T>>;
};

/**
 * Renders one RHF-controlled text field from a `TextFieldConfig`, choosing a
 * plain `Input` or a sanitising `MaskedInput` based on the config's `mask`. Used
 * across the onboarding wizard and every profile/admin editor so validation and
 * input rules stay identical wherever a field appears.
 */
export function ControlledTextField<T extends FieldValues>({
  control,
  config,
}: ControlledTextFieldProps<T>) {
  const { name, label, placeholder, mask, maxLength, fullWidth } = config;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', fullWidth && 'sm:col-span-2')}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {mask ? (
              <MaskedInput
                mask={mask}
                maxLength={maxLength}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
              />
            ) : (
              <Input
                maxLength={maxLength}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
