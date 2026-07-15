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
  type OvertimeSettingsInput,
  overtimeSettingsSchema,
} from '@/schema/settings';

export function OvertimeSettingsForm() {
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<OvertimeSettingsInput>({
    resolver: zodResolver(overtimeSettingsSchema),
    defaultValues: { overtimeMultiplier: settings?.overtimeMultiplier ?? 0 },
    values: settings && { overtimeMultiplier: settings.overtimeMultiplier },
  });

  const { execute, isPending } = useUpdatePayrollSettings(() =>
    toast.success(
      `Overtime multiplier set to ${form.getValues('overtimeMultiplier')}x`,
    ),
  );

  const onSubmit = (values: OvertimeSettingsInput) => execute(values);

  if (isLoading || !settings) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  return (
    <Card className='w-full'>
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
