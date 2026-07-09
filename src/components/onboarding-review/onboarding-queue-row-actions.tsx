'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useApproveEmployee } from '@/hooks/actions/use-review-employee';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

import { ReturnOnboardingDialog } from './return-onboarding-dialog';

import { Employee } from '@/types/hrm';

type OnboardingQueueRowActionsProps = {
  employee: Employee;
};

/** Per-row review controls: inspect the full profile, approve (→ active), or
 *  return the submission with a note (→ onboarding). */
export function OnboardingQueueRowActions({
  employee,
}: OnboardingQueueRowActionsProps) {
  const { execute, isPending } = useApproveEmployee(() =>
    toast.success(`${employee.fullName || 'Employee'} approved and activated`),
  );

  return (
    <div className='flex items-center justify-end gap-2'>
      <Link href={`${paths.admin.employees}/${employee.id}`}>
        <Button variant='ghost' size='sm' icon={ArrowRight}>
          View
        </Button>
      </Link>
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
