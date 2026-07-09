'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useHrmSettings } from '@/hooks/queries/settings';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { QueryKeys } from '@/constants/query-keys';
import { type HrmSettingsInput, hrmSettingsSchema } from '@/schema/settings';

import { HrmSettings } from '@/types/hrm';

/** Payroll-wide config. Only the overtime multiplier exists so far — the
 *  rest of what a real settings screen needs (medical accrual, leave pool,
 *  email templates) hasn't been scoped yet. */
export function OvertimeSettingsForm() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<HrmSettingsInput>({
    resolver: zodResolver(hrmSettingsSchema),
    defaultValues: { overtimeMultiplier: settings?.overtimeMultiplier ?? 0 },
    values: settings,
  });

  const onSubmit = (values: HrmSettingsInput) => {
    queryClient.setQueryData<HrmSettings>([QueryKeys.HRM_SETTINGS], values);
    toast.success(`Overtime multiplier set to ${values.overtimeMultiplier}x`);
  };

  if (isLoading || !settings) {
    return <Skeleton className='h-56 w-full max-w-md rounded-xl' />;
  }

  return (
    <Card className='max-w-md'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='overtimeMultiplier'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overtime multiplier</FormLabel>
                  <FormControl>
                    <Input type='number' step={0.1} min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Applied to the hourly rate when a payroll cycle is
                    calculated. Never shown to employees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
