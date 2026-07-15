'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdatePayrollSettings } from '@/hooks/actions/use-update-payroll-settings';
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

import {
  type LeaveSettingsInput,
  leaveSettingsSchema,
} from '@/schema/settings';

export function LeaveSettingsForm() {
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<LeaveSettingsInput>({
    resolver: zodResolver(leaveSettingsSchema),
    defaultValues: { leavePoolDays: settings?.leavePoolDays ?? 0 },
    values: settings && { leavePoolDays: settings.leavePoolDays },
  });

  const { execute, isPending } = useUpdatePayrollSettings(() =>
    toast.success(`Leave pool set to ${form.getValues('leavePoolDays')} days`),
  );

  const onSubmit = (values: LeaveSettingsInput) => execute(values);

  if (isLoading || !settings) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>Leave</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='leavePoolDays'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual leave pool (days)</FormLabel>
                  <FormControl>
                    <Input type='number' step={1} min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Shared across Paid, Sick, and Half Day leave. Resets each
                    year.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type='submit' isLoading={isPending}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
