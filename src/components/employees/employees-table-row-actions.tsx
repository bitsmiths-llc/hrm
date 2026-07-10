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

import { Employee } from '@/types/hrm';

type EmployeesTableRowActionsProps = {
  employee: Employee;
};

/** Per-row directory controls. View is always available; the actions menu holds
 *  Resend / Cancel, which only make sense before the invite is accepted — so the
 *  menu is disabled entirely unless the row is still `invited`. */
export function EmployeesTableRowActions({
  employee,
}: EmployeesTableRowActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const label = employee.fullName || employee.email;
  const isInvited = employee.status === 'invited';

  const resend = useResendInvite(() =>
    toast.success(`Invitation resent to ${employee.email}`),
  );

  return (
    <div className='flex items-center justify-end gap-1'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            disabled={!isInvited}
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

      <Link href={`${paths.admin.employees}/${employee.id}`}>
        <Button variant='ghost' size='sm' icon={ArrowRight}>
          View
        </Button>
      </Link>

      {/* Rendered outside the menu so it isn't unmounted when the menu closes
          on select. */}
      <CancelInviteDialog
        employeeId={employee.id}
        employeeName={label}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
