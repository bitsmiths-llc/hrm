import { InfoCard } from '@/components/hrm/info-card';

import { formatCurrency } from '@/utils/number-functions';

import { employmentTypeLabels } from '@/constants/hrm-labels';

import { Employee } from '@/types/hrm';

type EmploymentReadonlyProps = {
  employee: Employee;
};

/** Employment & payroll details are admin-owned (salary, designation,
 *  department, type). Rendered read-only here — there is no self-write policy
 *  on `employment_details`, so the DB backs this too (BIT-11). */
export function EmploymentReadonly({ employee }: EmploymentReadonlyProps) {
  return (
    <InfoCard
      title='Employment (managed by admin)'
      fields={[
        {
          label: 'Employment type',
          value: employmentTypeLabels[employee.employmentType],
        },
        { label: 'Designation', value: employee.designation },
        { label: 'Department', value: employee.department },
        { label: 'Base salary', value: formatCurrency(employee.baseSalary) },
        {
          label: 'Working hours / month',
          value: employee.workingHours ? `${employee.workingHours}h` : '',
        },
      ]}
    />
  );
}
