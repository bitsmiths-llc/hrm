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
  type MedicalSettingsInput,
  medicalSettingsSchema,
} from '@/schema/settings';

import { HrmSettings } from '@/types/hrm';

export function MedicalSettingsForm() {
  const queryClient = useQueryClient();
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

  const onSubmit = (values: MedicalSettingsInput) => {
    queryClient.setQueryData<HrmSettings>([QueryKeys.HRM_SETTINGS], (old) =>
      old ? { ...old, ...values } : old,
    );
    toast.success('Medical allowance settings saved');
  };

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
