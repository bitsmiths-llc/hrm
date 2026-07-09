'use client';

import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { RichTextEditor } from '@/components/hrm/rich-text-editor';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type ControlledRichTextProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  disabled?: boolean;
};

export function ControlledRichText<TFieldValues extends FieldValues>({
  name,
  label,
  disabled,
}: ControlledRichTextProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {!!label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
