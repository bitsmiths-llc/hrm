'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdatePayrollSettings } from '@/hooks/actions/use-update-payroll-settings';
import { useHrmSettings } from '@/hooks/queries/settings';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

import { type HrmSettingsInput, hrmSettingsSchema } from '@/schema/settings';

import { SettingRow, SettingsCard, SettingsGroup } from './settings-card';
import { UnitInput } from './unit-input';

/** Every numeric HRM rule — leave, medical, payroll — edited in one card so
 *  the Configuration tab reads as a single console instead of scattered
 *  boxes. Saves all values in one pass to the settings cache. */
export function HrmSettingsForm() {
  const { data: settings, isLoading } = useHrmSettings();

  const form = useForm<HrmSettingsInput>({
    resolver: zodResolver(hrmSettingsSchema),
    values: settings ?? undefined,
  });

  // Persist to the real `payroll_settings` singleton (Module 2 backend). On
  // success the action invalidates the settings query, so `values: settings`
  // re-syncs the form and clears the dirty state.
  const { execute, isPending } = useUpdatePayrollSettings(() =>
    toast.success('Configuration saved'),
  );

  const onSubmit = (values: HrmSettingsInput) => execute(values);

  if (isLoading || !settings) {
    return <Skeleton className='h-96 rounded-xl' />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='contents'>
        <SettingsCard
          icon={SlidersHorizontal}
          title='Rules & Limits'
          description='Values applied whenever leave, medical, or payroll is calculated.'
          footer={
            <Button
              type='submit'
              size='sm'
              disabled={!form.formState.isDirty}
              isLoading={isPending}
            >
              Save changes
            </Button>
          }
        >
          <SettingsGroup label='Leave'>
            <FormField
              control={form.control}
              name='leavePoolDays'
              render={({ field }) => (
                <FormItem className='py-0'>
                  <SettingRow
                    label='Annual leave pool'
                    description='Paid, Sick, and Half Day share it. Resets yearly.'
                  >
                    <FormControl>
                      <UnitInput
                        type='number'
                        step={1}
                        min={0}
                        unit='days'
                        {...field}
                      />
                    </FormControl>
                  </SettingRow>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsGroup>

          <SettingsGroup label='Medical Allowance'>
            <FormField
              control={form.control}
              name='medicalMonthlyAccrual'
              render={({ field }) => (
                <FormItem className='py-0'>
                  <SettingRow
                    label='Monthly accrual'
                    description="Added to each eligible employee's balance."
                  >
                    <FormControl>
                      <UnitInput
                        type='number'
                        step={500}
                        min={0}
                        unit='PKR'
                        {...field}
                      />
                    </FormControl>
                  </SettingRow>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='medicalBalanceCap'
              render={({ field }) => (
                <FormItem className='py-0'>
                  <SettingRow
                    label='Balance cap'
                    description='Accrual stops once a balance reaches this.'
                  >
                    <FormControl>
                      <UnitInput
                        type='number'
                        step={500}
                        min={0}
                        unit='PKR'
                        {...field}
                      />
                    </FormControl>
                  </SettingRow>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsGroup>

          <SettingsGroup label='Payroll'>
            <FormField
              control={form.control}
              name='overtimeMultiplier'
              render={({ field }) => (
                <FormItem className='py-0'>
                  <SettingRow
                    label='Overtime multiplier'
                    description='Applied to the hourly rate on every payroll run.'
                  >
                    <FormControl>
                      <UnitInput
                        type='number'
                        step={0.1}
                        min={0}
                        unit='×'
                        {...field}
                      />
                    </FormControl>
                  </SettingRow>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='taxRatePercent'
              render={({ field }) => (
                <FormItem className='py-0'>
                  <SettingRow
                    label='Tax deduction rate'
                    description='Withheld from gross each cycle. 0 disables it.'
                  >
                    <FormControl>
                      <UnitInput
                        type='number'
                        step={0.5}
                        min={0}
                        max={100}
                        unit='%'
                        {...field}
                      />
                    </FormControl>
                  </SettingRow>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsGroup>
        </SettingsCard>
      </form>
    </Form>
  );
}
