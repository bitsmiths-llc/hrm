'use client';

import { useState } from 'react';

import { useLeaveRequests } from '@/hooks/queries/leave';

import { MonthFilter } from '@/components/hrm/month-filter';
import { LeaveBalanceCards } from '@/components/leave/leave-balance-cards';
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table';

type EmployeeLeaveTabProps = {
  employeeId: string;
};

export function EmployeeLeaveTab({ employeeId }: EmployeeLeaveTabProps) {
  const [month, setMonth] = useState('all');
  const { data: requests, isLoading: requestsLoading } =
    useLeaveRequests(employeeId);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <LeaveBalanceCards employeeId={employeeId} month={month} />
      <LeaveRequestsTable
        requests={requests}
        isLoading={requestsLoading}
        emptyDescription="This employee hasn't requested leave yet."
        month={month}
      />
    </div>
  );
}
