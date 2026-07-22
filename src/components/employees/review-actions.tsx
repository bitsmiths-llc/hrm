'use client';

import { Check } from 'lucide-react';
import { toast } from 'sonner';

import { useApproveEmployee } from '@/hooks/actions/use-review-employee';

import { Button } from '@/components/ui/button';

import { ReturnOnboardingDialog } from './return-onboarding-dialog';

import { Employee } from '@/types/hrm';

type EmployeeReviewActionsProps = {
  employee: Employee;
};

/** Onboarding review controls for a `submitted` employee: approve (→ active) or
 *  return the submission with a note (→ onboarding). Folded in from the former
 *  standalone onboarding queue — now shown inline on the employees table row and
 *  in the employee detail page header. Callers should only render it while the
 *  employee is `submitted`. */
export function EmployeeReviewActions({
  employee,
}: EmployeeReviewActionsProps) {
  const { execute, isPending } = useApproveEmployee(() =>
    toast.success(`${employee.fullName || 'Employee'} approved and activated`),
  );

  return (
    <div className='flex items-center gap-2'>
      <ReturnOnboardingDialog
        employeeId={employee.id}
        employeeName={employee.fullName || employee.email}
      />
      <Button
        size='sm'
        iconLeft={Check}
        isLoading={isPending}
        onClick={() => execute({ employeeId: employee.id })}
      >
        Approve
      </Button>
    </div>
  );
}
