'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { formatCurrency } from '@/utils/number-functions';

const addFieldSchema = z.object({
  label: z.string().min(2, 'Enter a label'),
  amount: z.coerce.number({ invalid_type_error: 'Enter an amount' }),
});
type AddFieldInput = z.infer<typeof addFieldSchema>;

type CustomFieldsCellProps = {
  fields: { label: string; amount: number }[];
  onAdd: (field: { label: string; amount: number }) => void;
  /** Removes the item at the given index of `fields` (the caller maps it
   *  back to its own storage). Omit to disallow removal. */
  onRemove?: (index: number) => void;
  /** True once the cycle is locked — hides the add-field form. */
  disabled?: boolean;
  /** Example label for the input — e.g. "Bonus" for earnings, "Loan" for
   *  deductions. */
  labelPlaceholder?: string;
};

/** Per-employee ad-hoc line items (bonus, deduction, etc.) that fold into
 *  the row's total. Shown as a small button — the running sum once fields
 *  exist, a plain "+" before that. */
export function CustomFieldsCell({
  fields,
  onAdd,
  onRemove,
  disabled,
  labelPlaceholder = 'Bonus',
}: CustomFieldsCellProps) {
  const total = fields.reduce((sum, field) => sum + field.amount, 0);

  const form = useForm<AddFieldInput>({
    resolver: zodResolver(addFieldSchema),
    defaultValues: { label: '', amount: 0 },
  });

  const onSubmit = (values: AddFieldInput) => {
    onAdd(values);
    form.reset();
  };

  if (disabled && fields.length === 0) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
        >
          {fields.length > 0 ? (
            formatCurrency(total) || '0'
          ) : (
            <Plus className='size-3.5' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72'>
        <div className='flex flex-col gap-2'>
          {fields.length > 0 && (
            <ul className='flex flex-col gap-1'>
              {fields.map((field, index) => (
                <li
                  key={index}
                  className='flex items-center justify-between gap-2 text-sm'
                >
                  <span className='min-w-0 truncate text-muted-foreground'>
                    {field.label}
                  </span>
                  <span className='flex shrink-0 items-center gap-1'>
                    {formatCurrency(field.amount)}
                    {!disabled && !!onRemove && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-5 text-muted-foreground hover:text-destructive'
                        onClick={() => onRemove(index)}
                        aria-label={`Remove ${field.label}`}
                      >
                        <X className='size-3.5' />
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!disabled && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex items-end gap-2 border-t border-border pt-2'
              >
                <FormField
                  control={form.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className='text-xs'>Label</FormLabel>
                      <FormControl>
                        <Input
                          className='h-8'
                          placeholder={labelPlaceholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem className='w-24'>
                      <FormLabel className='text-xs'>Amount</FormLabel>
                      <FormControl>
                        <Input type='number' className='h-8' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  size='icon'
                  className='h-8 w-8 shrink-0'
                  aria-label='Add field'
                >
                  <Plus className='size-4' />
                </Button>
              </form>
            </Form>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
