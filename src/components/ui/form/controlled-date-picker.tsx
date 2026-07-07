'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

type ControlledDatePickerProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  /** Restrict selectable dates, e.g. { after: new Date() } disabled. */
  disabledDates?: React.ComponentProps<typeof Calendar>['disabled'];
  containerClassName?: string;
};

/** RHF-controlled date picker. Stores the value as an ISO date string
 *  (yyyy-MM-dd) to stay serializable and schema-friendly. */
export function ControlledDatePicker<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = 'Pick a date',
  disabledDates,
  containerClassName,
}: ControlledDatePickerProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selected = field.value
          ? new Date(`${field.value}T00:00:00`)
          : undefined;
        return (
          <FormItem className={containerClassName}>
            {!!label && <FormLabel>{label}</FormLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    iconLeft={CalendarIcon}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {selected ? format(selected, 'dd/MM/yyyy') : placeholder}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={selected}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                  }
                  captionLayout='dropdown'
                  defaultMonth={selected}
                  disabled={disabledDates}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
