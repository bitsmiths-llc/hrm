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
  /** Applied to the FormItem — e.g. `flex-1` so the field stretches inside
   *  a flex column (a sheet) instead of hugging its content. */
  containerClassName?: string;
  /** Forwarded to the editor wrapper for height/layout overrides. */
  editorClassName?: string;
};

export function ControlledRichText<TFieldValues extends FieldValues>({
  name,
  label,
  disabled,
  containerClassName,
  editorClassName,
}: ControlledRichTextProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={containerClassName}>
          {!!label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              disabled={disabled}
              className={editorClassName}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
