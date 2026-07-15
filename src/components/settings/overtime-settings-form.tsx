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
import {
  type OvertimeSettingsInput,
  overtimeSettingsSchema,
} from '@/schema/settings';

import { HrmSettings } from '@/types/hrm';

export function OvertimeSettingsForm() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<OvertimeSettingsInput>({
    resolver: zodResolver(overtimeSettingsSchema),
    defaultValues: {
      overtimeMultiplier: settings?.overtimeMultiplier ?? 0,
      taxRatePercent: settings?.taxRatePercent ?? 0,
    },
    values: settings && {
      overtimeMultiplier: settings.overtimeMultiplier,
      taxRatePercent: settings.taxRatePercent,
    },
  });

  const onSubmit = (values: OvertimeSettingsInput) => {
    queryClient.setQueryData<HrmSettings>([QueryKeys.HRM_SETTINGS], (old) =>
      old ? { ...old, ...values } : old,
    );
    toast.success('Payroll settings saved');
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
            <FormField
              control={form.control}
              name='taxRatePercent'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax deduction rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step={0.5}
                      min={0}
                      max={100}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of gross earnings withheld as tax each cycle. Set
                    to 0 to disable tax withholding.
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
