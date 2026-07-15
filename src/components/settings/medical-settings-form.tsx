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
  type MedicalSettingsInput,
  medicalSettingsSchema,
} from '@/schema/settings';

export function MedicalSettingsForm() {
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<MedicalSettingsInput>({
    resolver: zodResolver(medicalSettingsSchema),
    defaultValues: {
      medicalMonthlyAccrual: settings?.medicalMonthlyAccrual ?? 0,
      medicalBalanceCap: settings?.medicalBalanceCap ?? 0,
    },
    values: settings && {
      medicalMonthlyAccrual: settings.medicalMonthlyAccrual,
      medicalBalanceCap: settings.medicalBalanceCap,
    },
  });

  const { execute, isPending } = useUpdatePayrollSettings(() =>
    toast.success('Medical allowance settings saved'),
  );

  const onSubmit = (values: MedicalSettingsInput) => execute(values);

  if (isLoading || !settings) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>Medical Allowance</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='medicalMonthlyAccrual'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly accrual (PKR)</FormLabel>
                  <FormControl>
                    <Input type='number' step={500} min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Adds to each eligible employee's balance every month.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='medicalBalanceCap'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance cap (PKR)</FormLabel>
                  <FormControl>
                    <Input type='number' step={500} min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Accrual stops adding once a balance reaches this cap.
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
