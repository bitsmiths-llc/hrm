'use client';

import { ArrowLeft, UserX } from 'lucide-react';
import Link from 'next/link';

import { useEmployee } from '@/hooks/queries/employees';

import { EmptyState } from '@/components/hrm/empty-state';
import { InfoCard } from '@/components/hrm/info-card';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { formatDate } from '@/utils/date-functions';

import { employmentTypeLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

import { EmployeeContractTab } from './employee-contract-tab';
import { EmployeeLeaveTab } from './employee-leave-tab';
import { EmployeeMedicalTab } from './employee-medical-tab';
import { EmployeeOvertimeTab } from './employee-overtime-tab';
import { EmployeePayrollTab } from './employee-payroll-tab';
import { EmploymentConfigForm } from './employment-config-form';

type EmployeeDetailProps = {
  employeeId: string;
};

export function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  const { data: employee, isLoading } = useEmployee(employeeId);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <Skeleton className='h-16 w-full max-w-md rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
      </div>
    );
  }

  if (!employee) {
    return (
      <EmptyState
        icon={UserX}
        title='Employee not found'
        description='This person may have been removed, or the link is outdated.'
      >
        <Link href={paths.admin.employees}>
          <Button variant='outline' iconLeft={ArrowLeft}>
            Back to directory
          </Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <>
      <div>
        <Link href={paths.admin.employees}>
          <Button variant='ghost' size='sm' iconLeft={ArrowLeft}>
            Back to employees
          </Button>
        </Link>
      </div>
      <PageHeader
        title={employee.fullName}
        description={`${employee.designation || 'No designation yet'} · ${employmentTypeLabels[employee.employmentType]}`}
      >
        <StatusBadge status={employee.status} />
      </PageHeader>

      <Tabs defaultValue='profile'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='leave'>Leave</TabsTrigger>
          <TabsTrigger value='medical'>Medical</TabsTrigger>
          <TabsTrigger value='overtime'>Overtime</TabsTrigger>
          <TabsTrigger value='payroll'>Payroll</TabsTrigger>
          <TabsTrigger value='contract'>Contract</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='flex flex-col gap-6'>
          <InfoCard
            title='Personal Information'
            fields={[
              { label: 'Email', value: employee.email },
              { label: 'Phone', value: employee.phone },
              {
                label: 'Emergency contact',
                value: employee.emergencyContact,
              },
              {
                label: 'Date of birth',
                value: formatDate(employee.dateOfBirth),
              },
              { label: 'CNIC', value: employee.cnic },
              { label: 'Address', value: employee.address },
              { label: 'Invited', value: formatDate(employee.invitedAt) },
              { label: 'Joined', value: formatDate(employee.joinedAt) },
            ]}
          />

          <InfoCard
            title='Bank Information'
            fields={[
              { label: 'Bank', value: employee.bank?.bankName },
              {
                label: 'Account holder',
                value: employee.bank?.accountHolderName,
              },
              {
                label: 'Account number',
                value: employee.bank?.accountNumber,
              },
              { label: 'IBAN', value: employee.bank?.iban },
              { label: 'Branch', value: employee.bank?.branch },
            ]}
          />

          <InfoCard
            title='Social Accounts'
            fields={[
              { label: 'GitHub', value: employee.social?.github },
              { label: 'LinkedIn', value: employee.social?.linkedin },
              { label: 'Twitter', value: employee.social?.twitter },
            ]}
          />

          <EmploymentConfigForm employee={employee} />
        </TabsContent>

        <TabsContent value='leave'>
          <EmployeeLeaveTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value='medical'>
          <EmployeeMedicalTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value='overtime'>
          <EmployeeOvertimeTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value='payroll'>
          <EmployeePayrollTab employeeId={employee.id} />
        </TabsContent>

        <TabsContent value='contract'>
          <EmployeeContractTab employeeId={employee.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}
