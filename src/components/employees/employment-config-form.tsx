'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';

import { employmentTypeLabels } from '@/constants/hrm-labels';
import {
  type EmploymentConfigInput,
  employmentConfigSchema,
} from '@/schema/employee';

import { Employee } from '@/types/hrm';

const employmentTypeOptions = Object.entries(employmentTypeLabels).map(
  ([value, label]) => ({ value, label }),
);

type EmploymentConfigFormProps = {
  employee: Employee;
};

/** Admin-only payroll configuration (PRD 4.1) — not part of onboarding. */
export function EmploymentConfigForm({ employee }: EmploymentConfigFormProps) {
  const form = useForm<EmploymentConfigInput>({
    resolver: zodResolver(employmentConfigSchema),
    defaultValues: {
      employmentType: employee.employmentType,
      baseSalary: employee.baseSalary || 0,
      workingHours: employee.workingHours || 0,
      designation: employee.designation,
    },
  });

  const onSubmit = async (values: EmploymentConfigInput) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(
      `Employment config saved for ${employee.fullName} (${employmentTypeLabels[values.employmentType]})`,
    );
  };

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>
          Employment & Payroll Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 sm:grid-cols-2'
          >
            <ControlledSelect<EmploymentConfigInput>
              name='employmentType'
              label='Employment type'
              options={employmentTypeOptions}
              placeholder='Select type'
            />
            <FormField
              control={form.control}
              name='designation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder='Frontend Engineer' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='baseSalary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base salary (PKR)</FormLabel>
                  <FormControl>
                    <Input type='number' min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='workingHours'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working hours / period</FormLabel>
                  <FormControl>
                    <Input type='number' min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='sm:col-span-2'>
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Save configuration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
