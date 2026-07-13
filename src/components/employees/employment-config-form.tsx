'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateEmploymentDetails } from '@/hooks/actions/use-update-employee';

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

import {
  employmentStageLabels,
  employmentTypeLabels,
} from '@/constants/hrm-labels';
import {
  type EmploymentConfigInput,
  employmentConfigSchema,
} from '@/schema/employee';

import { Employee } from '@/types/hrm';

const employmentTypeOptions = Object.entries(employmentTypeLabels).map(
  ([value, label]) => ({ value, label }),
);

const employmentStageOptions = Object.entries(employmentStageLabels).map(
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
      employmentStage: employee.employmentStage,
      baseSalary: employee.baseSalary || 0,
      workingHours: employee.workingHours || 0,
      designation: employee.designation,
      department: employee.department,
    },
  });

  const { execute, isPending } = useUpdateEmploymentDetails(employee.id, () =>
    toast.success('Employment configuration saved'),
  );

  const onSubmit = (values: EmploymentConfigInput) =>
    execute({ ...values, employeeId: employee.id });

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
            <ControlledSelect<EmploymentConfigInput>
              name='employmentStage'
              label='Employment stage'
              options={employmentStageOptions}
              placeholder='Select stage'
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
              name='department'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Engineering'
                      {...field}
                      value={field.value ?? ''}
                    />
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
              <Button type='submit' isLoading={isPending}>
                Save configuration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
