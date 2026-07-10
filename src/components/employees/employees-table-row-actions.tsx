'use client';

import { ArrowRight, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useResendInvite } from '@/hooks/actions/use-invite-employee';

import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

import { CancelInviteDialog } from './cancel-invite-dialog';

import { Employee } from '@/types/hrm';

type EmployeesTableRowActionsProps = {
  employee: Employee;
};

/** Per-row directory controls. Every row can be opened; a row still awaiting its
 *  invite (status `invited`) additionally gets Resend / Cancel, which only make
 *  sense before the person has accepted. */
export function EmployeesTableRowActions({
  employee,
}: EmployeesTableRowActionsProps) {
  const label = employee.fullName || employee.email;

  const resend = useResendInvite(() =>
    toast.success(`Invitation resent to ${employee.email}`),
  );

  return (
    <div className='flex items-center justify-end gap-1'>
      {employee.status === 'invited' && (
        <>
          <Button
            variant='ghost'
            size='sm'
            iconLeft={Send}
            isLoading={resend.isPending}
            onClick={() => resend.execute({ employeeId: employee.id })}
          >
            Resend
          </Button>
          <CancelInviteDialog employeeId={employee.id} employeeName={label} />
        </>
      )}
      <Link href={`${paths.admin.employees}/${employee.id}`}>
        <Button variant='ghost' size='sm' icon={ArrowRight}>
          View
        </Button>
      </Link>
    </div>
  );
}
