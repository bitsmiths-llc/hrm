'use client';

import { ArrowRight, MoreHorizontal, Send, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useResendInvite } from '@/hooks/actions/use-invite-employee';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { paths } from '@/constants/paths';

import { CancelInviteDialog } from './cancel-invite-dialog';
import { EmployeeReviewActions } from './review-actions';

import { Employee } from '@/types/hrm';

type EmployeesTableRowActionsProps = {
  employee: Employee;
};

/** Per-row directory controls, keyed to the row's lifecycle stage. View is
 *  always available. A `submitted` row carries the onboarding-review controls
 *  (approve / return) folded in from the former queue; an `invited` row carries
 *  the invite lifecycle controls (resend / cancel). Any other status shows just
 *  View. */
export function EmployeesTableRowActions({
  employee,
}: EmployeesTableRowActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const label = employee.fullName || employee.email;
  const isInvited = employee.status === 'invited';
  const isSubmitted = employee.status === 'submitted';

  const resend = useResendInvite(() =>
    toast.success(`Invitation resent to ${employee.email}`),
  );

  return (
    <div className='flex items-center justify-end gap-1'>
      {isSubmitted && <EmployeeReviewActions employee={employee} />}

      {isInvited && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8'
              aria-label={`Invite actions for ${label}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuItem
              disabled={resend.isPending}
              onSelect={() => resend.execute({ employeeId: employee.id })}
            >
              <Send />
              Resend invite
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setCancelOpen(true)}
              className='text-destructive focus:text-destructive'
            >
              <X />
              Cancel invite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Link href={`${paths.admin.employees}/${employee.id}`}>
        <Button variant='ghost' size='sm' icon={ArrowRight}>
          View
        </Button>
      </Link>

      {/* Rendered outside the menu so it isn't unmounted when the menu closes
          on select. */}
      {isInvited && (
        <CancelInviteDialog
          employeeId={employee.id}
          employeeName={label}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
      )}
    </div>
  );
}
